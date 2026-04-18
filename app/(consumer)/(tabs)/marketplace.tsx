// Consumer Home — mirrors web /home.html (top bar, pets, services grid, nearby sitters,
// upcoming booking, top hosts, become-a-host banner, recent activity, community, invite).

import { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Screen } from '../../../components/ui/Screen';
import { api } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import { colors, radius, spacing, typography } from '../../../lib/theme';
import type { Pet, Provider, Service } from '../../../lib/types';

const ORANGE = '#e8734a';
const ORANGE_DARK = '#c9572b';
const PRIMARY_SOFT = '#fde5d0';

type ProviderWithServices = Provider & { services: Service[] };

const SERVICES = [
  { key: 'GROOMING', title: 'Groomers', desc: 'Find trusted groomers nearby', bg: '#cff3eb', fg: '#0d7a65', img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=180&h=180&fit=crop' },
  { key: 'BOARDING', title: 'Boarders', desc: 'Verified boarders near you', bg: '#fde5d0', fg: '#9a4215', img: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=180&h=180&fit=crop' },
  { key: 'TRAINING', title: 'Trainers', desc: 'Tricks and skills for your pet', bg: '#fdd5d5', fg: '#991b1b', img: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=180&h=180&fit=crop' },
  { key: 'SITTING', title: 'Sitters', desc: 'Trusted sitters at your home', bg: '#dbeafe', fg: '#1e40af', img: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=180&h=180&fit=crop' },
  { key: 'WALKING', title: 'Walkers', desc: 'Daily walks by verified walkers', bg: '#d1fae5', fg: '#065f46', img: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=180&h=180&fit=crop' },
  { key: 'DAYCARE', title: 'Daycare', desc: 'Fun-filled daycare stays', bg: '#fef3c7', fg: '#78510c', img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=180&h=180&fit=crop' },
] as const;

const TOP_HOSTS = [
  { name: 'Kavita R.', img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&h=280&fit=crop&crop=faces,center', tag: 'Top Rated', tagBg: ORANGE, price: 950, rating: 5.0, reviews: 212 },
  { name: 'Vikram D.', img: 'https://images.unsplash.com/photo-1560743641-3914f2c45636?w=500&h=280&fit=crop&crop=faces,center', tag: 'Most Booked', tagBg: ORANGE, price: 750, rating: 4.9, reviews: 189 },
  { name: 'Ananya P.', img: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=280&fit=crop&crop=faces,center', tag: 'New & Rising', tagBg: '#1a1a1a', price: 600, rating: 4.8, reviews: 23 },
];

const ACTIVITY = [
  { title: 'Priya M.', sub: 'Viewed · 2 hrs ago', cta: 'View', img: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=136&fit=crop' },
  { title: 'Boarding · Rahul', sub: 'Mar 15 · Completed', cta: 'Rebook', img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=136&fit=crop' },
  { title: 'Grooming · Sneha', sub: 'Saved service', cta: 'Book', img: 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=300&h=136&fit=crop' },
  { title: 'Training Pack', sub: 'Viewed · Yesterday', cta: 'View', img: 'https://images.unsplash.com/photo-1560743641-3914f2c45636?w=300&h=136&fit=crop' },
];

const COMMUNITY = [
  { user: 'Riya & Bruno', initial: 'R', color: ORANGE, caption: "Bruno had the best time at Priya's! Highly recommend for boarding 🐾", likes: 48, comments: 12, img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=420&h=240&fit=crop' },
  { user: 'Aisha & Momo', initial: 'A', color: '#9c27b0', caption: 'First grooming session done! Momo looks fabulous now 😍', likes: 31, comments: 8, img: 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=420&h=240&fit=crop' },
  { user: 'Karan & Duke', initial: 'K', color: '#f44336', caption: '3 weeks of training and Duke can finally sit and stay! 🎉', likes: 67, comments: 19, img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=420&h=240&fit=crop' },
];

function Stars({ n }: { n: number }) {
  const full = Math.round(n);
  return <Text style={styles.stars}>{'★'.repeat(full)}{'☆'.repeat(5 - full)}</Text>;
}

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [sitters, setSitters] = useState<ProviderWithServices[]>([]);
  const [booking, setBooking] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [petsRes, mktRes, bkRes] = await Promise.all([
      api.get<Pet[]>('/api/pets'),
      api.get<{ providers: ProviderWithServices[] }>(
        `/api/marketplace?${user?.city ? `city=${encodeURIComponent(user.city)}` : ''}`,
      ),
      api.get<any[]>('/api/bookings?status=ACCEPTED'),
    ]);
    if (petsRes.success && petsRes.data) setPets(petsRes.data);
    if (mktRes.success && mktRes.data) setSitters(mktRes.data.providers);
    if (bkRes.success && bkRes.data && bkRes.data.length) setBooking(bkRes.data[0]);
    setRefreshing(false);
  }, [user?.city]);

  useEffect(() => { load(); }, [load]);

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <Screen>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Image source={require('../../../assets/images/logo.png')} style={styles.headerLogo} resizeMode="contain" />
        <Pressable style={styles.notifBtn} onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={20} color={colors.gray800} />
          <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>3</Text></View>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing['2xl'] }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={ORANGE} />}
      >
        {/* Greeting card */}
        <View style={styles.greetCard}>
          <View style={styles.greetBlob1} />
          <View style={styles.greetBlob2} />
          <Text style={styles.greetName}>Hey, {firstName}!</Text>
          <Text style={styles.greetSub}>
            {pets[0]?.name ? `${pets[0].name} is ready for the next adventure!` : 'Discover trusted pet care near you.'}
          </Text>
        </View>

        {/* My Pet bubbles */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petRow}>
          {pets.map((p) => (
            <Pressable key={p.id} style={styles.petBubble} onPress={() => router.push(`/pets/${p.id}` as any)}>
              {p.photo ? (
                <Image source={{ uri: p.photo }} style={styles.petImg} />
              ) : (
                <View style={[styles.petImg, styles.petImgPlaceholder]}>
                  <Ionicons name="paw" size={28} color={ORANGE} />
                </View>
              )}
              <Text style={styles.petName}>{p.name}</Text>
            </Pressable>
          ))}
          <Pressable style={styles.petBubble} onPress={() => router.push('/(consumer)/onboarding' as any)}>
            <View style={styles.petAdd}>
              <Ionicons name="add" size={26} color={colors.gray800} />
            </View>
            <Text style={[styles.petName, { color: colors.gray500 }]}>Add Pet</Text>
          </Pressable>
        </ScrollView>

        {/* Services grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Services</Text></View>
          <View style={styles.svcGrid}>
            {SERVICES.map((s) => (
              <Pressable key={s.key} style={[styles.svcCard, { backgroundColor: s.bg }]} onPress={() => router.push(`/marketplace?category=${s.key}` as any)}>
                <View style={{ zIndex: 1 }}>
                  <Text style={[styles.svcTitle, { color: s.fg }]}>{s.title}</Text>
                  <Text style={[styles.svcDesc, { color: s.fg }]}>{s.desc}</Text>
                </View>
                <View style={styles.svcArrow}>
                  <Ionicons name="chevron-forward" size={14} color={s.fg} />
                </View>
                <Image source={{ uri: s.img }} style={styles.svcImg} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Nearby Sitters */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Sitters</Text>
            <Text style={styles.viewAll}>View all</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {sitters.slice(0, 6).map((p) => {
              const minPrice = p.services.length ? Math.min(...p.services.map((s) => s.price)) : null;
              return (
                <Pressable key={p.id} style={styles.hostCard} onPress={() => router.push(`/marketplace/${p.id}` as any)}>
                  <View style={styles.hostImg}>
                    {p.profilePhoto ? (
                      <Image source={{ uri: p.profilePhoto }} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <View style={[styles.hostImgPlaceholder]}>
                        <Ionicons name="storefront-outline" size={32} color={ORANGE} />
                      </View>
                    )}
                    <View style={styles.distPill}><Text style={styles.distPillText}>2.1 km</Text></View>
                  </View>
                  <View style={{ padding: spacing.md }}>
                    <View style={styles.tagRow}>
                      {p.verificationStatus === 'VERIFIED' && <View style={[styles.tag, styles.tagV]}><Text style={styles.tagTextV}>Verified</Text></View>}
                      <View style={[styles.tag, styles.tagE]}><Text style={styles.tagTextE}>Pro</Text></View>
                    </View>
                    <Text style={styles.hostName}>{p.name}</Text>
                    <View style={styles.rateRow}>
                      <Stars n={p.averageRating || 0} />
                      <Text style={styles.rnum}>{p.averageRating?.toFixed(1) || '—'}</Text>
                      <Text style={styles.rcnt}>({p.totalReviews || 0})</Text>
                    </View>
                    {minPrice !== null && (
                      <Text style={styles.hostPrice}>₹{minPrice} <Text style={styles.hostPriceSmall}>/ day</Text></Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Upcoming Booking */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Booking</Text>
            <Text style={styles.viewAll} onPress={() => router.push('/bookings')}>All bookings</Text>
          </View>
          {booking ? (
            <View style={styles.bookingCard}>
              <View style={styles.bkTop}>
                <View style={styles.bkSvc}>
                  <View style={styles.bkIcon}><Ionicons name="home-outline" size={20} color={ORANGE} /></View>
                  <View>
                    <Text style={styles.bkSvcName}>{booking.service?.title}</Text>
                    <Text style={styles.bkHost}>with {booking.provider?.name}</Text>
                  </View>
                </View>
                <View style={styles.statusConfirmed}><Text style={styles.statusConfirmedText}>Confirmed</Text></View>
              </View>
              <View style={styles.bkDivider} />
              <View style={styles.bkMeta}>
                <View style={styles.bkMetaItem}>
                  <Ionicons name="calendar-outline" size={14} color={colors.gray600} />
                  <Text style={styles.bkMetaText}>{new Date(booking.date).toDateString()}</Text>
                </View>
                <View style={styles.bkMetaItem}>
                  <Ionicons name="time-outline" size={14} color={colors.gray600} />
                  <Text style={styles.bkMetaText}>{booking.startTime}</Text>
                </View>
              </View>
              <Pressable style={styles.bkCta} onPress={() => router.push('/bookings')}>
                <Text style={styles.bkCtaText}>View Details</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}><Ionicons name="calendar-outline" size={26} color={colors.gray500} /></View>
              <Text style={styles.emptyTitle}>No upcoming bookings</Text>
              <Text style={styles.emptySub}>Book a trusted host for your furry friend and they'll appear here.</Text>
              <Pressable style={styles.btnOutline}><Text style={styles.btnOutlineText}>Find a Host</Text></Pressable>
            </View>
          )}
        </View>

        {/* Top Hosts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Hosts</Text>
            <Text style={styles.viewAll}>View all</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {TOP_HOSTS.map((h) => (
              <View key={h.name} style={styles.featCard}>
                <View style={styles.featImg}>
                  <Image source={{ uri: h.img }} style={{ width: '100%', height: '100%' }} />
                  <View style={[styles.featTag, { backgroundColor: h.tagBg }]}><Text style={styles.featTagText}>{h.tag}</Text></View>
                </View>
                <View style={{ padding: spacing.md }}>
                  <View style={styles.featRow}>
                    <Text style={styles.featName}>{h.name}</Text>
                    <Text style={styles.featPrice}>₹{h.price} <Text style={styles.hostPriceSmall}>/ day</Text></Text>
                  </View>
                  <View style={[styles.rateRow, { marginTop: 4 }]}>
                    <Stars n={h.rating} />
                    <Text style={styles.rnum}>{h.rating.toFixed(1)}</Text>
                    <Text style={styles.rcnt}>({h.reviews})</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Become a Host */}
        <View style={styles.hostBanner}>
          <View style={styles.hostBannerBlob} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerLabel}>FOR PET LOVERS</Text>
            <Text style={styles.bannerTitle}>Love pets?{'\n'}Earn with PawMigos</Text>
            <Text style={styles.bannerSub}>Set your own schedule & earn ₹5,000+ per month.</Text>
            <Pressable style={styles.bannerBtn}><Text style={styles.bannerBtnText}>Become a Host</Text></Pressable>
          </View>
          <Text style={styles.bannerEmoji}>🐾</Text>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Text style={styles.viewAll}>See all</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {ACTIVITY.map((a) => (
              <View key={a.title} style={styles.actCard}>
                <Image source={{ uri: a.img }} style={styles.actThumb} />
                <Text style={styles.actTitle}>{a.title}</Text>
                <Text style={styles.actSub}>{a.sub}</Text>
                <View style={styles.actBtn}><Text style={styles.actBtnText}>{a.cta}</Text></View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Community */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Community</Text>
            <Text style={styles.viewAll} onPress={() => router.push('/community')}>Join now</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {COMMUNITY.map((c) => (
              <View key={c.user} style={styles.commCard}>
                <Image source={{ uri: c.img }} style={styles.commImg} />
                <View style={{ padding: spacing.md }}>
                  <View style={styles.commUser}>
                    <View style={[styles.commAvatar, { backgroundColor: c.color }]}><Text style={styles.commAvatarText}>{c.initial}</Text></View>
                    <Text style={styles.commUname}>{c.user}</Text>
                  </View>
                  <Text style={styles.commCaption} numberOfLines={2}>{c.caption}</Text>
                  <View style={styles.commEngage}>
                    <View style={styles.commEngageItem}><Ionicons name="heart-outline" size={13} color={colors.gray500} /><Text style={styles.commEngageText}>{c.likes}</Text></View>
                    <View style={styles.commEngageItem}><Ionicons name="chatbubble-outline" size={13} color={colors.gray500} /><Text style={styles.commEngageText}>{c.comments}</Text></View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Invite */}
        <View style={styles.inviteBanner}>
          <Text style={styles.inviteEmoji}>🎁</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.inviteTitle}>Invite & Earn ₹200</Text>
            <Text style={styles.inviteSub}>For every friend who joins PawMigos</Text>
          </View>
          <Pressable style={styles.inviteBtn}><Text style={styles.inviteBtnText}>Invite</Text></Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerLogo: { height: 32, width: 120 },
  notifBtn: {
    width: 40, height: 40, borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute', top: 5, right: 5,
    minWidth: 16, height: 16, paddingHorizontal: 4,
    backgroundColor: ORANGE, borderRadius: 8,
    borderWidth: 2, borderColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  notifBadgeText: { fontSize: 9, fontWeight: '700', color: '#fff' },

  // greeting
  greetCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: ORANGE,
    borderRadius: radius.xl,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  greetBlob1: { position: 'absolute', top: -30, right: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.08)' },
  greetBlob2: { position: 'absolute', bottom: -40, right: 50, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.06)' },
  greetName: { ...typography.h2, color: '#fff', fontWeight: '800' },
  greetSub: { ...typography.caption, color: 'rgba(255,255,255,0.82)', marginTop: 4 },

  // pets
  petRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.md, flexDirection: 'row' },
  petBubble: { alignItems: 'center', gap: 6, marginRight: spacing.md },
  petImg: { width: 76, height: 76, borderRadius: 20, borderWidth: 2.5, borderColor: ORANGE },
  petImgPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: PRIMARY_SOFT },
  petAdd: { width: 76, height: 76, borderRadius: 20, backgroundColor: '#F2F2F2', borderWidth: 1.5, borderColor: '#C0C0C0', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  petName: { fontSize: 13, fontWeight: '600', color: colors.gray900 },

  // sections
  section: { marginBottom: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.gray900 },
  viewAll: { fontSize: 13, fontWeight: '600', color: ORANGE },
  hScroll: { paddingHorizontal: spacing.lg, gap: spacing.md, flexDirection: 'row' },

  // services grid
  svcGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.lg, justifyContent: 'space-between' },
  svcCard: { width: '48.5%', minHeight: 140, borderRadius: radius.xl, padding: spacing.md, overflow: 'hidden', justifyContent: 'space-between' },
  svcTitle: { fontSize: 17, fontWeight: '800' },
  svcDesc: { fontSize: 11, opacity: 0.75, marginTop: 2 },
  svcArrow: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.12)', alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
  svcImg: { position: 'absolute', right: -4, bottom: 0, width: 88, height: 88, opacity: 0.9 },

  // host card
  hostCard: { width: 190, backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', marginRight: spacing.md, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  hostImg: { width: '100%', height: 120, backgroundColor: colors.gray100 },
  hostImgPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: PRIMARY_SOFT },
  distPill: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  distPillText: { fontSize: 10, fontWeight: '600', color: '#fff' },
  tagRow: { flexDirection: 'row', gap: 6, marginBottom: 6, flexWrap: 'wrap' },
  tag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  tagV: { backgroundColor: '#e8f5e9' },
  tagE: { backgroundColor: PRIMARY_SOFT },
  tagTextV: { fontSize: 9, fontWeight: '700', color: '#2e7d32', textTransform: 'uppercase' },
  tagTextE: { fontSize: 9, fontWeight: '700', color: ORANGE, textTransform: 'uppercase' },
  hostName: { fontSize: 14, fontWeight: '700', color: colors.gray900, marginBottom: 3 },
  rateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  stars: { color: '#f59e0b', fontSize: 11 },
  rnum: { fontSize: 13, fontWeight: '600', color: colors.gray900 },
  rcnt: { fontSize: 12, color: colors.gray500 },
  hostPrice: { fontSize: 14, fontWeight: '700', color: ORANGE },
  hostPriceSmall: { fontSize: 11, fontWeight: '500', color: colors.gray500 },

  // booking card
  bookingCard: { marginHorizontal: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 2, borderColor: colors.borderSubtle },
  bkTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  bkSvc: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  bkIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: PRIMARY_SOFT, alignItems: 'center', justifyContent: 'center' },
  bkSvcName: { fontSize: 15, fontWeight: '700', color: colors.gray900 },
  bkHost: { fontSize: 13, color: colors.gray500 },
  statusConfirmed: { backgroundColor: '#e8f5e9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusConfirmedText: { fontSize: 11, fontWeight: '700', color: '#2e7d32' },
  bkDivider: { height: 1, backgroundColor: colors.borderSubtle, marginBottom: spacing.md },
  bkMeta: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.md },
  bkMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bkMetaText: { fontSize: 13, color: colors.gray600, fontWeight: '500' },
  bkCta: { height: 44, backgroundColor: ORANGE, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  bkCtaText: { fontSize: 15, fontWeight: '600', color: '#fff' },

  // empty
  empty: { marginHorizontal: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: colors.border },
  emptyIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: colors.gray900, marginBottom: 4 },
  emptySub: { fontSize: 13, color: colors.gray500, textAlign: 'center', marginBottom: spacing.md },
  btnOutline: { height: 42, paddingHorizontal: spacing.lg, borderRadius: radius.md, borderWidth: 2, borderColor: ORANGE, alignItems: 'center', justifyContent: 'center' },
  btnOutlineText: { fontSize: 14, fontWeight: '600', color: ORANGE },

  // featured cards
  featCard: { width: 250, backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', marginRight: spacing.md, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  featImg: { width: '100%', height: 140, backgroundColor: colors.gray100 },
  featTag: { position: 'absolute', top: spacing.sm, left: spacing.sm, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  featTagText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  featRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  featName: { fontSize: 14, fontWeight: '700', color: colors.gray900 },
  featPrice: { fontSize: 14, fontWeight: '700', color: ORANGE },

  // host banner
  hostBanner: { marginHorizontal: spacing.lg, marginBottom: spacing.lg, backgroundColor: '#1c1c1e', borderRadius: radius.xl, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, overflow: 'hidden' },
  hostBannerBlob: { position: 'absolute', top: -20, right: 70, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(232,115,74,0.18)' },
  bannerLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: ORANGE, marginBottom: 4 },
  bannerTitle: { fontSize: 19, fontWeight: '800', color: '#fff', lineHeight: 24, marginBottom: 6 },
  bannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: spacing.md },
  bannerBtn: { height: 40, paddingHorizontal: spacing.md, backgroundColor: ORANGE, borderRadius: 999, alignSelf: 'flex-start', alignItems: 'center', justifyContent: 'center' },
  bannerBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  bannerEmoji: { fontSize: 48 },

  // activity
  actCard: { width: 150, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginRight: spacing.md, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  actThumb: { width: '100%', height: 68, borderRadius: 8, marginBottom: spacing.sm, backgroundColor: colors.gray100 },
  actTitle: { fontSize: 13, fontWeight: '700', color: colors.gray900 },
  actSub: { fontSize: 11, color: colors.gray500, marginTop: 2, marginBottom: spacing.sm },
  actBtn: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, backgroundColor: PRIMARY_SOFT, borderRadius: 999 },
  actBtnText: { fontSize: 11, fontWeight: '700', color: ORANGE },

  // community
  commCard: { width: 210, backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', marginRight: spacing.md, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  commImg: { width: '100%', height: 120, backgroundColor: colors.gray100 },
  commUser: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm },
  commAvatar: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  commAvatarText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  commUname: { fontSize: 13, fontWeight: '600', color: colors.gray900 },
  commCaption: { fontSize: 13, color: colors.gray700, marginBottom: spacing.sm, lineHeight: 18 },
  commEngage: { flexDirection: 'row', gap: spacing.md },
  commEngageItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  commEngageText: { fontSize: 11, color: colors.gray500, fontWeight: '500' },

  // invite
  inviteBanner: { marginHorizontal: spacing.lg, marginBottom: spacing.lg, backgroundColor: PRIMARY_SOFT, borderRadius: radius.xl, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1.5, borderColor: 'rgba(232,115,74,0.18)' },
  inviteEmoji: { fontSize: 38 },
  inviteTitle: { fontSize: 15, fontWeight: '700', color: colors.gray900 },
  inviteSub: { fontSize: 13, color: colors.gray500 },
  inviteBtn: { height: 40, paddingHorizontal: spacing.md, backgroundColor: ORANGE, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  inviteBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
