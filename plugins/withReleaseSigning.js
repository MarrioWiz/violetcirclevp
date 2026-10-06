// Config plugin: firma "release" y ajustes de Gradle que sobreviven a `expo prebuild --clean`.
// La llave vive FUERA de android/ (en keystore/, ignorado por git), así regenerar android/ no la borra.
const { withAppBuildGradle, withGradleProperties } = require('expo/config-plugins');

const SIGNING_CONFIG = `
        release {
            def propsFile = rootProject.file("../keystore/keystore.properties")
            if (propsFile.exists()) {
                def props = new Properties()
                propsFile.withInputStream { props.load(it) }
                storeFile rootProject.file("../keystore/" + props["storeFile"])
                storePassword props["storePassword"]
                keyAlias props["keyAlias"]
                keyPassword props["keyPassword"]
            }
        }`;

function withReleaseSigning(config, { architectures = 'arm64-v8a,armeabi-v7a' } = {}) {
  config = withAppBuildGradle(config, (cfg) => {
    let gradle = cfg.modResults.contents;
    if (!gradle.includes('keystore.properties')) {
      gradle = gradle.replace(/signingConfigs\s*\{/, (m) => `${m}${SIGNING_CONFIG}`);
      // En el buildType release, usar la firma release si existe la llave (si no, la de debug).
      gradle = gradle.replace(
        /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig\s+signingConfigs\.debug/,
        `$1signingConfig rootProject.file("../keystore/keystore.properties").exists() ? signingConfigs.release : signingConfigs.debug`,
      );
    }
    cfg.modResults.contents = gradle;
    return cfg;
  });

  return withGradleProperties(config, (cfg) => {
    const set = (key, value) => {
      const item = cfg.modResults.find((p) => p.type === 'property' && p.key === key);
      if (item) item.value = value;
      else cfg.modResults.push({ type: 'property', key, value });
    };
    // El valor por defecto (2 GB / 512 MB) se queda sin Metaspace en el lint de release.
    set('org.gradle.jvmargs', '-Xmx4096m -XX:MaxMetaspaceSize=1024m');
    set('reactNativeArchitectures', architectures);
    set('android.enableMinifyInReleaseBuilds', 'true');
    set('android.enableShrinkResourcesInReleaseBuilds', 'true');
    return cfg;
  });
}

module.exports = withReleaseSigning;
