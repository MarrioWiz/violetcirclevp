import { Camera, Mail, MessageCircle, Music2, Users, type LucideIcon } from 'lucide-react-native';

/** Ícono genérico por plataforma (sin logos de marca). Lo usan Orienta, Mis registros y Vi. */
export const PLATFORM_ICON: Record<string, LucideIcon> = {
  whatsapp: MessageCircle,
  instagram: Camera,
  tiktok: Music2,
  facebook: Users,
  otra: Mail,
};
