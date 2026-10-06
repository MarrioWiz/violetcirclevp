// Config plugin: el ícono alterno de expo-alternate-app-icons crea un <activity-alias>
// sin etiqueta, así que en el lanzador seguiría diciendo "VioletCircleVP".
// Este plugin le pone su propia etiqueta (p. ej. "Calculadora") para que sea discreto.
const { withAndroidManifest, withStringsXml, AndroidConfig } = require('expo/config-plugins');

const toPascal = (s) => s.replace(/(^\w|[-_\s]\w)/g, (m) => m.replace(/[-_\s]/, '').toUpperCase());

/** @param {Record<string, string>} labels nombre del ícono → etiqueta visible */
function withDiscreetIconLabel(config, labels) {
  config = withStringsXml(config, (cfg) => {
    for (const [name, label] of Object.entries(labels)) {
      cfg.modResults = AndroidConfig.Strings.setStringItem(
        [{ $: { name: `app_name_${name.toLowerCase()}`, translatable: 'false' }, _: label }],
        cfg.modResults,
      );
    }
    return cfg;
  });

  return withAndroidManifest(config, (cfg) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults);
    const aliases = app['activity-alias'] ?? [];
    for (const name of Object.keys(labels)) {
      const aliasName = `.MainActivity${toPascal(name)}`;
      const alias = aliases.find((a) => a.$['android:name'] === aliasName);
      if (alias) alias.$['android:label'] = `@string/app_name_${name.toLowerCase()}`;
    }
    return cfg;
  });
}

module.exports = withDiscreetIconLabel;
