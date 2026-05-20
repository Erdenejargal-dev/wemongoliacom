import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState, ReactNode } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonDetail } from '@/components/ui/Skeleton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { C } from '@/constants/Colors';
import { S } from '@/constants/Spacing';
import {
  useProviderAccommodation,
  useUpdateAccommodation,
  useArchiveAccommodation,
  type ProviderAccommodation,
} from '@/hooks/useProviderTours';
import {
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
  useRoomAvailability,
  useUpdateAvailabilityDay,
  type RoomType,
  type RoomAvailabilityRecord,
} from '@/hooks/useProviderAccommodation';

// ─── Constants ───────────────────────────────────────────────────────────────

const ACCOMMODATION_TYPES = [
  { value: 'ger_camp',   label: 'Ger Camp'   },
  { value: 'hotel',      label: 'Hotel'      },
  { value: 'lodge',      label: 'Lodge'      },
  { value: 'guesthouse', label: 'Guesthouse' },
  { value: 'resort',     label: 'Resort'     },
  { value: 'hostel',     label: 'Hostel'     },
  { value: 'homestay',   label: 'Homestay'   },
] as const;

const COMMON_AMENITIES = [
  'WiFi', 'Free Parking', 'Breakfast Included', 'Restaurant',
  'Bar', 'Swimming Pool', 'Spa', 'Fitness Center',
  'Air Conditioning', 'Heating', 'Hot Water', 'Laundry',
  '24h Reception', 'Airport Transfer', 'Generator Power', 'Tour Desk',
];

const STATUS_OPTIONS = [
  { value: 'draft',  label: 'Draft'  },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
] as const;

const STATUS_COLOR: Record<string, string> = {
  active: '#10B981',
  draft:  C.warning,
  paused: C.error,
};

const BED_TYPES = ['Single', 'Twin', 'Double', 'Queen', 'King', 'Dorm', 'Mixed'];

const ROOM_AMENITIES = [
  'WiFi', 'Private Bathroom', 'Shared Bathroom', 'TV',
  'Air Conditioning', 'Heating', 'Hot Water', 'Safe',
  'Wardrobe', 'Mini Fridge', 'Balcony', 'Mountain View',
];

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

// ─── Shared UI ───────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function Card({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function FieldRow({
  label, value, onChangeText, placeholder, multiline, keyboardType, last,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; multiline?: boolean; keyboardType?: any; last?: boolean;
}) {
  return (
    <View style={[styles.fieldRow, !last && styles.fieldRowBorder]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && styles.fieldInputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? '—'}
        placeholderTextColor={C.textSubtle}
        keyboardType={keyboardType}
        multiline={multiline}
        scrollEnabled={false}
        autoCorrect={false}
      />
    </View>
  );
}

function FieldRowH({ label, children, last }: { label: string; children: ReactNode; last?: boolean }) {
  return (
    <View style={[styles.fieldRowH, !last && styles.fieldRowBorder]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <View style={styles.starRow}>
      {[1,2,3,4,5].map((n) => (
        <TouchableOpacity
          key={n}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onChange(n === value ? 0 : n); }}
          hitSlop={4}
        >
          <Text style={[styles.star, n <= value && styles.starActive]}>★</Text>
        </TouchableOpacity>
      ))}
      {value > 0 && <Text style={styles.starHint}>{value}-star</Text>}
    </View>
  );
}

function Stepper({ value, onChange, min = 1, max = 99 }: {
  value: number; onChange: (n: number) => void; min?: number; max?: number;
}) {
  return (
    <View style={styles.stepperRow}>
      <TouchableOpacity
        style={[styles.stepperBtn, value <= min && styles.stepperBtnDis]}
        onPress={() => { if (value > min) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onChange(value - 1); } }}
      >
        <Text style={styles.stepperBtnText}>−</Text>
      </TouchableOpacity>
      <Text style={styles.stepperVal}>{value}</Text>
      <TouchableOpacity
        style={[styles.stepperBtn, value >= max && styles.stepperBtnDis]}
        onPress={() => { if (value < max) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onChange(value + 1); } }}
      >
        <Text style={styles.stepperBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ acc, accId }: { acc: ProviderAccommodation; accId: string }) {
  const update = useUpdateAccommodation();

  const [name,               setName]               = useState(acc.name ?? '');
  const [accommodationType,  setAccommodationType]  = useState(acc.accommodationType ?? '');
  const [starRating,         setStarRating]         = useState(acc.starRating ?? 0);
  const [description,        setDescription]        = useState(acc.description ?? '');
  const [city,               setCity]               = useState(acc.city ?? '');
  const [region,             setRegion]             = useState(acc.region ?? '');
  const [address,            setAddress]            = useState(acc.address ?? '');
  const [checkInTime,        setCheckInTime]        = useState(acc.checkInTime ?? '');
  const [checkOutTime,       setCheckOutTime]       = useState(acc.checkOutTime ?? '');
  const [cancellationPolicy, setCancellationPolicy] = useState(acc.cancellationPolicy ?? '');
  const [amenities,          setAmenities]          = useState<string[]>(acc.amenities ?? []);
  const [status,             setStatus]             = useState<'draft' | 'active' | 'paused'>((acc.status as any) ?? 'draft');

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setName(acc.name ?? '');
    setAccommodationType(acc.accommodationType ?? '');
    setStarRating(acc.starRating ?? 0);
    setDescription(acc.description ?? '');
    setCity(acc.city ?? '');
    setRegion(acc.region ?? '');
    setAddress(acc.address ?? '');
    setCheckInTime(acc.checkInTime ?? '');
    setCheckOutTime(acc.checkOutTime ?? '');
    setCancellationPolicy(acc.cancellationPolicy ?? '');
    setAmenities(acc.amenities ?? []);
    setStatus((acc.status as any) ?? 'draft');
  }, [acc]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function toggleAmenity(a: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  }

  async function handleSave() {
    if (!name.trim()) { Alert.alert('Required', 'Property name cannot be empty.'); return; }
    try {
      await update.mutateAsync({
        id: accId,
        data: {
          name: name.trim(),
          accommodationType: accommodationType || undefined,
          starRating: starRating || null,
          description: description.trim() || undefined,
          city: city.trim() || undefined,
          region: region.trim() || undefined,
          address: address.trim() || undefined,
          checkInTime: checkInTime.trim() || undefined,
          checkOutTime: checkOutTime.trim() || undefined,
          cancellationPolicy: cancellationPolicy.trim() || undefined,
          amenities,
          status,
        },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error ?? 'Failed to save.');
    }
  }

  const customAmenities = amenities.filter((a) => !COMMON_AMENITIES.includes(a));

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.tabScroll}
        contentContainerStyle={styles.tabScrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SectionHeader title="Basic Information" />
        <Card>
          <FieldRow label="Property name" value={name} onChangeText={setName} placeholder="Name your property" />
          <FieldRow label="Description" value={description} onChangeText={setDescription} placeholder="What makes this place special" multiline last />
        </Card>

        <View style={styles.sectionWrap}>
          <SectionHeader title="Property Type" />
          <Card>
            <View style={styles.chipGrid}>
              {ACCOMMODATION_TYPES.map((t) => {
                const active = accommodationType === t.value;
                return (
                  <TouchableOpacity
                    key={t.value}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAccommodationType(active ? '' : t.value); }}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{t.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        </View>

        <View style={styles.sectionWrap}>
          <SectionHeader title="Star Rating" />
          <Card>
            <View style={styles.starSection}>
              <Text style={styles.fieldLabel}>Official classification</Text>
              <StarRating value={starRating} onChange={setStarRating} />
            </View>
          </Card>
        </View>

        <View style={styles.sectionWrap}>
          <SectionHeader title="Location" />
          <Card>
            <FieldRow label="City"    value={city}    onChangeText={setCity}    placeholder="e.g. Ulaanbaatar" />
            <FieldRow label="Region"  value={region}  onChangeText={setRegion}  placeholder="e.g. Töv Aimag" />
            <FieldRow label="Address" value={address} onChangeText={setAddress} placeholder="Street address" last />
          </Card>
        </View>

        <View style={styles.sectionWrap}>
          <SectionHeader title="Policies" />
          <Card>
            <FieldRow label="Check-in"  value={checkInTime}  onChangeText={setCheckInTime}  placeholder="e.g. 14:00" />
            <FieldRow label="Check-out" value={checkOutTime} onChangeText={setCheckOutTime} placeholder="e.g. 11:00" />
            <FieldRow label="Cancellation" value={cancellationPolicy} onChangeText={setCancellationPolicy} placeholder="Describe your cancellation terms…" multiline last />
          </Card>
        </View>

        <View style={styles.sectionWrap}>
          <SectionHeader title="Amenities" />
          <Card>
            <View style={styles.chipGrid}>
              {COMMON_AMENITIES.map((a) => {
                const active = amenities.includes(a);
                return (
                  <TouchableOpacity key={a} style={[styles.chip, active && styles.chipBlueActive]} onPress={() => toggleAmenity(a)}>
                    <Text style={[styles.chipText, active && styles.chipBlueText]}>{active ? '✓ ' : ''}{a}</Text>
                  </TouchableOpacity>
                );
              })}
              {customAmenities.map((a) => (
                <TouchableOpacity key={a} style={[styles.chip, styles.chipBlueActive]} onPress={() => toggleAmenity(a)}>
                  <Text style={[styles.chipText, styles.chipBlueText]}>✓ {a}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </View>

        <View style={styles.sectionWrap}>
          <SectionHeader title="Listing Status" />
          <Card>
            <View style={styles.statusRow}>
              {STATUS_OPTIONS.map((opt) => {
                const active = status === opt.value;
                const col = STATUS_COLOR[opt.value];
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.statusOption, active && { backgroundColor: col + '18', borderColor: col }]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setStatus(opt.value); }}
                  >
                    <View style={[styles.statusDotSmall, { backgroundColor: active ? col : C.textSubtle }]} />
                    <Text style={[styles.statusOptionText, active && { color: col, fontFamily: 'Manrope_600SemiBold' }]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.saveBtn, update.isPending && styles.saveBtnDisabled]} onPress={handleSave} disabled={update.isPending}>
            <Text style={styles.saveBtnText}>{update.isPending ? 'Saving…' : 'Save changes'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Room Form Sheet ──────────────────────────────────────────────────────────

function RoomFormSheet({ visible, accId, room, onClose }: {
  visible: boolean; accId: string; room: RoomType | null; onClose: () => void;
}) {
  const create = useCreateRoom();
  const update = useUpdateRoom();

  const [name,         setName]         = useState('');
  const [bedType,      setBedType]      = useState('');
  const [maxGuests,    setMaxGuests]    = useState(2);
  const [quantity,     setQuantity]     = useState(1);
  const [description,  setDescription]  = useState('');
  const [baseAmount,   setBaseAmount]   = useState('');
  const [baseCurrency, setBaseCurrency] = useState<'MNT' | 'USD'>('MNT');
  const [amenities,    setAmenities]    = useState<string[]>([]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!visible) return;
    if (room) {
      setName(room.name ?? '');
      setBedType(room.bedType ?? '');
      setMaxGuests(room.maxGuests ?? 2);
      setQuantity(room.quantity ?? 1);
      setDescription(room.description ?? '');
      setBaseAmount(String(room.baseAmount ?? ''));
      setBaseCurrency((room.baseCurrency as 'MNT' | 'USD') ?? 'MNT');
      setAmenities(room.amenities ?? []);
    } else {
      setName(''); setBedType(''); setMaxGuests(2); setQuantity(1);
      setDescription(''); setBaseAmount(''); setBaseCurrency('MNT'); setAmenities([]);
    }
  }, [visible, room]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function handleSubmit() {
    if (!name.trim()) { Alert.alert('Required', 'Room name is required.'); return; }
    const amount = parseFloat(baseAmount);
    if (isNaN(amount) || amount <= 0) { Alert.alert('Required', 'Enter a valid price per night.'); return; }
    try {
      if (room) {
        await update.mutateAsync({ accId, roomId: room.id, data: { name: name.trim(), bedType: bedType || undefined, maxGuests, quantity, description: description.trim() || undefined, baseAmount: amount, baseCurrency, amenities } });
      } else {
        await create.mutateAsync({ accId, data: { name: name.trim(), bedType: bedType || undefined, maxGuests, quantity, description: description.trim() || undefined, baseAmount: amount, baseCurrency, amenities } });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error ?? 'Failed to save room.');
    }
  }

  const isPending = create.isPending || update.isPending;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.sheetScreen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheetHeader}>
          <TouchableOpacity onPress={onClose} style={{ paddingVertical: 4 }}>
            <Text style={styles.sheetCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.sheetTitle}>{room ? 'Edit Room' : 'Add Room Type'}</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.sheetBody} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <SectionHeader title="Room Name" />
          <Card>
            <FieldRow label="Name" value={name} onChangeText={setName} placeholder="e.g. Deluxe Ger, Standard Room" last />
          </Card>

          <View style={styles.sectionWrap}>
            <SectionHeader title="Bed Type" />
            <Card>
              <View style={styles.chipGrid}>
                {BED_TYPES.map((bt) => {
                  const active = bedType === bt;
                  return (
                    <TouchableOpacity key={bt} style={[styles.chip, active && styles.chipActive]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setBedType(active ? '' : bt); }}>
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{bt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>
          </View>

          <View style={styles.sectionWrap}>
            <SectionHeader title="Capacity" />
            <Card>
              <FieldRowH label="Max guests" last={false}>
                <Stepper value={maxGuests} onChange={setMaxGuests} min={1} max={20} />
              </FieldRowH>
              <FieldRowH label="Number of units" last>
                <Stepper value={quantity} onChange={setQuantity} min={1} max={500} />
              </FieldRowH>
            </Card>
          </View>

          <View style={styles.sectionWrap}>
            <SectionHeader title="Pricing" />
            <Card>
              <FieldRowH label="Currency" last={false}>
                <View style={styles.currencyRow}>
                  {(['MNT', 'USD'] as const).map((c) => (
                    <TouchableOpacity key={c} style={[styles.currencyPill, baseCurrency === c && styles.currencyPillActive]} onPress={() => setBaseCurrency(c)}>
                      <Text style={[styles.currencyPillText, baseCurrency === c && styles.currencyPillTextActive]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </FieldRowH>
              <FieldRow label="Price per night" value={baseAmount} onChangeText={setBaseAmount} placeholder="0" keyboardType="numeric" last />
            </Card>
          </View>

          <View style={styles.sectionWrap}>
            <SectionHeader title="Description" />
            <Card>
              <FieldRow label="Room description" value={description} onChangeText={setDescription} placeholder="Describe this room type…" multiline last />
            </Card>
          </View>

          <View style={styles.sectionWrap}>
            <SectionHeader title="Amenities" />
            <Card>
              <View style={styles.chipGrid}>
                {ROOM_AMENITIES.map((a) => {
                  const active = amenities.includes(a);
                  return (
                    <TouchableOpacity key={a} style={[styles.chip, active && styles.chipBlueActive]} onPress={() => setAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a])}>
                      <Text style={[styles.chipText, active && styles.chipBlueText]}>{active ? '✓ ' : ''}{a}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>
          </View>

          <View style={{ marginTop: S[5] }}>
            <TouchableOpacity style={[styles.saveBtn, isPending && styles.saveBtnDisabled]} onPress={handleSubmit} disabled={isPending}>
              <Text style={styles.saveBtnText}>{isPending ? 'Saving…' : room ? 'Save changes' : 'Add room type'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Rooms Tab ────────────────────────────────────────────────────────────────

function RoomCard({ room, onEdit, onDelete }: { room: RoomType; onEdit: () => void; onDelete: () => void }) {
  const price = room.baseAmount ? `${room.baseAmount.toLocaleString()} ${room.baseCurrency ?? 'MNT'} / night` : null;
  const meta = [
    room.bedType,
    room.maxGuests ? `${room.maxGuests} guests` : null,
    room.quantity ? `${room.quantity} unit${room.quantity !== 1 ? 's' : ''}` : null,
  ].filter(Boolean).join(' · ');

  return (
    <View style={styles.roomCard}>
      <TouchableOpacity style={styles.roomCardBody} onPress={onEdit} activeOpacity={0.7}>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={styles.roomCardName}>{room.name}</Text>
          {!!meta && <Text style={styles.roomCardMeta}>{meta}</Text>}
          {!!price && <Text style={styles.roomCardPrice}>{price}</Text>}
        </View>
        <View style={styles.roomCardActions}>
          <TouchableOpacity style={styles.roomActionBtn} onPress={onEdit} hitSlop={8}>
            <IconSymbol name="pencil" size={13} color={C.blue} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.roomActionBtn, styles.roomActionDelete]} onPress={onDelete} hitSlop={8}>
            <IconSymbol name="trash" size={13} color={C.error} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function RoomsTab({ accId, roomTypes }: { accId: string; roomTypes: RoomType[] }) {
  const deleteRoom = useDeleteRoom();
  const [formVisible, setFormVisible] = useState(false);
  const [editingRoom,  setEditingRoom]  = useState<RoomType | null>(null);

  function openCreate() { setEditingRoom(null); setFormVisible(true); }
  function openEdit(r: RoomType) { setEditingRoom(r); setFormVisible(true); }

  function confirmDelete(room: RoomType) {
    Alert.alert('Delete room type', `Delete "${room.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteRoom.mutateAsync({ accId, roomId: room.id });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          } catch { Alert.alert('Error', 'Failed to delete room.'); }
        },
      },
    ]);
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.tabScroll} contentContainerStyle={styles.tabScrollContent} showsVerticalScrollIndicator={false}>
        {roomTypes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🛏</Text>
            <Text style={styles.emptyTitle}>No room types yet</Text>
            <Text style={styles.emptySub}>Add room types so guests can browse and book specific rooms</Text>
            <TouchableOpacity style={[styles.saveBtn, { marginTop: 8 }]} onPress={openCreate}>
              <Text style={styles.saveBtnText}>Add first room type</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <SectionHeader title={`${roomTypes.length} Room Type${roomTypes.length !== 1 ? 's' : ''}`} />
            {roomTypes.map((r, i) => (
              <View key={r.id} style={i > 0 ? { marginTop: 8 } : undefined}>
                <RoomCard room={r} onEdit={() => openEdit(r)} onDelete={() => confirmDelete(r)} />
              </View>
            ))}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.addRoomBtn} onPress={openCreate}>
                <IconSymbol name="plus" size={15} color={C.blue} />
                <Text style={styles.addRoomBtnText}>Add room type</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      <RoomFormSheet visible={formVisible} accId={accId} room={editingRoom} onClose={() => setFormVisible(false)} />
    </View>
  );
}

// ─── Calendar Tab ─────────────────────────────────────────────────────────────

function DayCell({ day, record, isToday, isPast, onPress }: {
  day: number | null;
  record: RoomAvailabilityRecord | null;
  isToday: boolean;
  isPast: boolean;
  onPress: () => void;
}) {
  if (!day) return <View style={styles.calDayEmpty} />;

  const status = record?.status ?? 'available';
  const booked = record?.bookedUnits ?? 0;

  let bg = '#FFFFFF';
  let textColor = C.textPrimary;
  let borderColor = 'transparent';

  if (isPast)                { bg = '#F8F8F8'; textColor = '#C8C8C8'; }
  else if (status === 'blocked')  { bg = '#FFF0F0'; textColor = '#E84040'; borderColor = '#E8404040'; }
  else if (status === 'sold_out') { bg = '#F0F0F0'; textColor = C.textSubtle; }
  else if (booked > 0)       { bg = '#EFF7FD'; textColor = C.blue; }

  if (isToday && !isPast) borderColor = C.navy;

  return (
    <TouchableOpacity
      style={[styles.calDay, { backgroundColor: bg, borderColor }]}
      onPress={onPress}
      disabled={isPast || status === 'sold_out'}
      activeOpacity={0.7}
    >
      <Text style={[styles.calDayNum, { color: textColor }, isToday && styles.calDayNumToday]}>
        {day}
      </Text>
      {status === 'blocked' && !isPast && <View style={[styles.calDot, { backgroundColor: '#E84040' }]} />}
      {booked > 0 && !isPast && status !== 'blocked' && <View style={[styles.calDot, { backgroundColor: C.blue }]} />}
    </TouchableOpacity>
  );
}

function CalendarTab({ accId, roomTypes }: { accId: string; roomTypes: RoomType[] }) {
  const today = new Date();
  const [selectedRoomId, setSelectedRoomId] = useState(roomTypes[0]?.id ?? '');
  const [calYear,  setCalYear]  = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const startDate = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-01`;
  const lastDay   = new Date(calYear, calMonth + 1, 0).getDate();
  const endDate   = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const { data: availability, isLoading } = useRoomAvailability(accId, selectedRoomId, startDate, endDate);
  const updateDay = useUpdateAvailabilityDay();

  const dayMap = useMemo<Record<string, RoomAvailabilityRecord>>(() => {
    const m: Record<string, RoomAvailabilityRecord> = {};
    (availability ?? []).forEach((r) => { m[r.date] = r; });
    return m;
  }, [availability]);

  const firstDow = new Date(calYear, calMonth, 1).getDay();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: lastDay }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  function prevMonth() {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
  }

  function handleDayPress(day: number) {
    if (!selectedRoomId) return;
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const cur = dayMap[dateStr]?.status ?? 'available';
    const next: 'available' | 'blocked' = cur === 'blocked' ? 'available' : 'blocked';
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateDay.mutate({ accId, roomId: selectedRoomId, date: dateStr, status: next });
  }

  function isToday(day: number) {
    return calYear === today.getFullYear() && calMonth === today.getMonth() && day === today.getDate();
  }
  function isPast(day: number) {
    return new Date(calYear, calMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }
  function dateKey(day: number) {
    return `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  if (roomTypes.length === 0) {
    return (
      <View style={[styles.emptyState, { flex: 1 }]}>
        <Text style={styles.emptyIcon}>📅</Text>
        <Text style={styles.emptyTitle}>No room types</Text>
        <Text style={styles.emptySub}>Add room types first to manage availability</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.tabScroll} contentContainerStyle={[styles.tabScrollContent, { paddingBottom: 60 }]} showsVerticalScrollIndicator={false}>
      {roomTypes.length > 1 && (
        <View style={{ marginBottom: S[4] }}>
          <SectionHeader title="Room Type" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roomPillRow}>
            {roomTypes.map((r) => {
              const active = selectedRoomId === r.id;
              return (
                <TouchableOpacity key={r.id} style={[styles.roomPill, active && styles.roomPillActive]} onPress={() => setSelectedRoomId(r.id)}>
                  <Text style={[styles.roomPillText, active && styles.roomPillTextActive]}>{r.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <View style={styles.calMonthNav}>
        <TouchableOpacity onPress={prevMonth} style={styles.calNavBtn} hitSlop={8}>
          <IconSymbol name="chevron.left" size={18} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.calMonthLabel}>{MONTHS[calMonth]} {calYear}</Text>
        <TouchableOpacity onPress={nextMonth} style={styles.calNavBtn} hitSlop={8}>
          <IconSymbol name="chevron.right" size={18} color={C.textPrimary} />
        </TouchableOpacity>
      </View>

      <Card style={styles.calCard}>
        <View style={styles.calDayLabelRow}>
          {DAY_LABELS.map((d) => (
            <Text key={d} style={styles.calDayLabel}>{d}</Text>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.calLoadingRow}>
            <Text style={styles.calLoadingText}>Loading availability…</Text>
          </View>
        ) : (
          weeks.map((week, wi) => (
            <View key={wi} style={styles.calWeekRow}>
              {week.map((day, di) => (
                <DayCell
                  key={di}
                  day={day}
                  record={day ? (dayMap[dateKey(day)] ?? null) : null}
                  isToday={day ? isToday(day) : false}
                  isPast={day ? isPast(day) : false}
                  onPress={() => day && handleDayPress(day)}
                />
              ))}
            </View>
          ))
        )}
      </Card>

      <View style={styles.calLegend}>
        {[
          { bg: '#FFFFFF', border: '#D5E8F5', label: 'Available' },
          { bg: '#FFF0F0', border: '#E84040', label: 'Blocked'   },
          { bg: '#EFF7FD', border: C.blue,    label: 'Has bookings' },
          { bg: '#F0F0F0', border: '#D0D0D0', label: 'Sold out'  },
        ].map((item) => (
          <View key={item.label} style={styles.calLegendItem}>
            <View style={[styles.calLegendSwatch, { backgroundColor: item.bg, borderColor: item.border }]} />
            <Text style={styles.calLegendText}>{item.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.calHint}>Tap any future day to toggle blocked / available</Text>
    </ScrollView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

type Tab = 'overview' | 'rooms' | 'calendar';
const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'rooms',    label: 'Rooms'    },
  { id: 'calendar', label: 'Calendar' },
];

export default function AccommodationEditScreen() {
  const { id }  = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const { data: acc, isLoading, isError } = useProviderAccommodation(id);
  const archive = useArchiveAccommodation();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  function handleArchive() {
    Alert.alert('Archive property', `Archive "${acc?.name}"? It will be hidden from travelers.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive', style: 'destructive',
        onPress: async () => {
          try { await archive.mutateAsync(id); router.back(); }
          catch { Alert.alert('Error', 'Failed to archive.'); }
        },
      },
    ]);
  }

  if (isLoading) return <SkeletonDetail />;
  if (isError || !acc) return <ErrorState title="Property not found" onRetry={() => router.back()} />;

  const thumb       = acc.images?.[0]?.imageUrl;
  const statusColor = STATUS_COLOR[acc.status] ?? C.textSubtle;
  const roomTypes   = acc.roomTypes ?? [];

  return (
    <View style={styles.screen}>
      {/* Hero */}
      <View style={styles.hero}>
        {thumb
          ? <Image source={{ uri: thumb }} style={StyleSheet.absoluteFill} contentFit="cover" />
          : <View style={[StyleSheet.absoluteFill, styles.heroPlaceholder]} />
        }
        <View style={styles.heroScrim} />
        <View style={styles.heroControls}>
          <TouchableOpacity style={styles.heroBtn} onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={18} color={C.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.heroBtn} onPress={handleArchive}>
            <IconSymbol name="trash" size={16} color={C.error} />
          </TouchableOpacity>
        </View>
        <View style={styles.heroMeta}>
          <View style={[styles.statusChip, { backgroundColor: statusColor + '28' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusChipText, { color: statusColor }]}>
              {acc.status.charAt(0).toUpperCase() + acc.status.slice(1)}
            </Text>
          </View>
          <Text style={styles.heroName} numberOfLines={2}>{acc.name}</Text>
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map((t) => {
          const active = activeTab === t.id;
          const badge = t.id === 'rooms' && roomTypes.length > 0 ? roomTypes.length : null;
          return (
            <TouchableOpacity key={t.id} style={[styles.tabItem, active && styles.tabItemActive]} onPress={() => setActiveTab(t.id)}>
              <View style={styles.tabItemInner}>
                <Text style={[styles.tabItemText, active && styles.tabItemTextActive]}>{t.label}</Text>
                {badge !== null && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{badge}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'overview' && <OverviewTab acc={acc} accId={id} />}
        {activeTab === 'rooms'    && <RoomsTab accId={id} roomTypes={roomTypes} />}
        {activeTab === 'calendar' && <CalendarTab accId={id} roomTypes={roomTypes} />}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bgPage },

  // ── Hero ──
  hero:            { height: 240, position: 'relative', backgroundColor: '#C8E8F6' },
  heroPlaceholder: { backgroundColor: '#C8E8F6' },
  heroScrim: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  heroControls: {
    position: 'absolute', top: 52, left: S[5], right: S[5],
    flexDirection: 'row', justifyContent: 'space-between',
  },
  heroBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  heroMeta: { position: 'absolute', bottom: 16, left: S[5], right: S[5], gap: 6 },
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start', borderRadius: 100,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  statusDot:      { width: 6, height: 6, borderRadius: 3 },
  statusChipText: { fontSize: 11, fontFamily: 'Manrope_600SemiBold' },
  heroName: {
    fontSize: 22, fontWeight: '700', color: '#FFFFFF',
    fontFamily: 'Manrope_700Bold', letterSpacing: -0.4,
    textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },

  // ── Tab bar ──
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#D5E8F5',
    paddingHorizontal: S[5],
  },
  tabItem: {
    flex: 1, paddingVertical: 13, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabItemActive:   { borderBottomColor: C.navy },
  tabItemInner:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tabItemText:     { fontSize: 13, fontFamily: 'Manrope_600SemiBold', color: C.textSubtle },
  tabItemTextActive: { color: C.navy },
  tabBadge: {
    backgroundColor: '#EBF3FA', borderRadius: 100,
    paddingHorizontal: 6, paddingVertical: 1,
  },
  tabBadgeText: { fontSize: 10, fontFamily: 'Manrope_700Bold', color: C.blue },

  // ── Shared section ──
  tabScroll:        { flex: 1 },
  tabScrollContent: { paddingHorizontal: S[5], paddingTop: S[4], paddingBottom: 48 },
  sectionWrap:      { marginTop: S[4] },
  sectionHeader: {
    fontSize: 11, fontWeight: '600', color: C.textSubtle,
    fontFamily: 'Manrope_600SemiBold', letterSpacing: 0.8,
    textTransform: 'uppercase', marginBottom: 8, paddingHorizontal: 2,
  },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    borderWidth: 0.5, borderColor: '#D5E8F5', overflow: 'hidden',
    shadowColor: '#4A90C4', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 1,
  },
  fieldRow:       { paddingHorizontal: 16, paddingVertical: 12 },
  fieldRowH: {
    paddingHorizontal: 16, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  fieldRowBorder: { borderBottomWidth: 0.5, borderBottomColor: '#EBF3FA' },
  fieldLabel: {
    fontSize: 11, color: C.textSubtle,
    fontFamily: 'Manrope_600SemiBold', letterSpacing: 0.3, marginBottom: 4,
  },
  fieldInput:      { fontSize: 15, color: C.textPrimary, fontFamily: 'Manrope_400Regular', padding: 0, minHeight: 22 },
  fieldInputMulti: { minHeight: 72, lineHeight: 22 },

  // ── Chips ──
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 14 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100,
    borderWidth: 1, borderColor: '#D5E8F5', backgroundColor: '#F4FAFF',
  },
  chipActive:     { backgroundColor: C.navy, borderColor: C.navy },
  chipText:       { fontSize: 13, color: C.textMuted, fontFamily: 'Manrope_600SemiBold' },
  chipTextActive: { color: '#FFFFFF' },
  chipBlueActive: { backgroundColor: '#EBF3FA', borderColor: C.blue },
  chipBlueText:   { color: C.blue, fontFamily: 'Manrope_600SemiBold' },

  // ── Stars ──
  starSection: { paddingHorizontal: 16, paddingVertical: 14 },
  starRow:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  star:        { fontSize: 28, color: '#D5E8F5' },
  starActive:  { color: '#F59E0B' },
  starHint:    { fontSize: 12, color: C.textSubtle, fontFamily: 'Manrope_400Regular', marginLeft: 4 },

  // ── Status options ──
  statusRow: { flexDirection: 'row', padding: 10, gap: 8 },
  statusOption: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: 12, borderWidth: 1, borderColor: '#D5E8F5', backgroundColor: '#F8FCFF',
  },
  statusDotSmall:    { width: 7, height: 7, borderRadius: 4 },
  statusOptionText:  { fontSize: 12, color: C.textMuted, fontFamily: 'Manrope_400Regular' },

  // ── Actions ──
  actions: { marginTop: S[5], gap: 12 },
  saveBtn: {
    height: 52, borderRadius: 100, backgroundColor: C.navy,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.navy, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24, shadowRadius: 12, elevation: 6,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', fontFamily: 'Manrope_700Bold', letterSpacing: 0.2 },

  // ── Room form sheet ──
  sheetScreen: { flex: 1, backgroundColor: C.bgPage },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: S[5], paddingVertical: S[4],
    borderBottomWidth: 0.5, borderBottomColor: '#D5E8F5',
    backgroundColor: '#FFFFFF',
  },
  sheetCancelText: { fontSize: 15, color: C.blue, fontFamily: 'Manrope_400Regular' },
  sheetTitle:      { fontSize: 16, fontFamily: 'Manrope_700Bold', color: C.textPrimary },
  sheetBody:       { paddingHorizontal: S[5], paddingTop: S[4], paddingBottom: 48 },

  // ── Stepper ──
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepperBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#EBF3FA', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#D5E8F5',
  },
  stepperBtnDis:  { opacity: 0.35 },
  stepperBtnText: { fontSize: 18, color: C.navy, lineHeight: 22 },
  stepperVal:     { fontSize: 16, fontFamily: 'Manrope_600SemiBold', color: C.textPrimary, minWidth: 28, textAlign: 'center' },

  // ── Currency ──
  currencyRow:           { flexDirection: 'row', gap: 8 },
  currencyPill:          { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 100, borderWidth: 1, borderColor: '#D5E8F5', backgroundColor: '#F4FAFF' },
  currencyPillActive:    { backgroundColor: C.navy, borderColor: C.navy },
  currencyPillText:      { fontSize: 13, fontFamily: 'Manrope_600SemiBold', color: C.textMuted },
  currencyPillTextActive:{ color: '#FFFFFF' },

  // ── Room card ──
  roomCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14,
    borderWidth: 0.5, borderColor: '#D5E8F5', overflow: 'hidden',
    shadowColor: '#4A90C4', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 1,
  },
  roomCardBody:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  roomCardName:    { fontSize: 15, fontFamily: 'Manrope_600SemiBold', color: C.textPrimary },
  roomCardMeta:    { fontSize: 12, fontFamily: 'Manrope_400Regular', color: C.textMuted },
  roomCardPrice:   { fontSize: 13, fontFamily: 'Manrope_600SemiBold', color: C.navy },
  roomCardActions: { flexDirection: 'row', gap: 8 },
  roomActionBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#EBF3FA', alignItems: 'center', justifyContent: 'center',
  },
  roomActionDelete: { backgroundColor: '#FFF0F0' },

  // ── Add room ──
  addRoomBtn: {
    height: 48, borderRadius: 100, borderWidth: 1.5, borderColor: C.blue,
    borderStyle: 'dashed', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  addRoomBtnText: { fontSize: 14, fontFamily: 'Manrope_600SemiBold', color: C.blue },

  // ── Room pill selector ──
  roomPillRow:          { gap: 8, paddingVertical: 4 },
  roomPill:             { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: '#D5E8F5', backgroundColor: '#F4FAFF' },
  roomPillActive:       { backgroundColor: C.navy, borderColor: C.navy },
  roomPillText:         { fontSize: 13, fontFamily: 'Manrope_600SemiBold', color: C.textMuted },
  roomPillTextActive:   { color: '#FFFFFF' },

  // ── Calendar ──
  calMonthNav:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: S[3] },
  calNavBtn:      { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  calMonthLabel:  { fontSize: 16, fontFamily: 'Manrope_700Bold', color: C.textPrimary },
  calCard:        { padding: 10 },
  calDayLabelRow: { flexDirection: 'row', marginBottom: 4 },
  calDayLabel:    { flex: 1, textAlign: 'center', fontSize: 11, fontFamily: 'Manrope_600SemiBold', color: C.textSubtle, letterSpacing: 0.4 },
  calWeekRow:     { flexDirection: 'row' },
  calDay: {
    flex: 1, height: 44, margin: 2, borderRadius: 8,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  calDayEmpty:    { flex: 1, height: 44, margin: 2 },
  calDayNum:      { fontSize: 14, fontFamily: 'Manrope_400Regular' },
  calDayNumToday: { fontFamily: 'Manrope_700Bold' },
  calDot: { position: 'absolute', bottom: 5, width: 4, height: 4, borderRadius: 2 },
  calLoadingRow:  { paddingVertical: 32, alignItems: 'center' },
  calLoadingText: { fontSize: 14, color: C.textSubtle, fontFamily: 'Manrope_400Regular' },
  calLegend:      { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 16 },
  calLegendItem:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  calLegendSwatch:{ width: 12, height: 12, borderRadius: 3, borderWidth: 1 },
  calLegendText:  { fontSize: 11, fontFamily: 'Manrope_400Regular', color: C.textMuted },
  calHint:        { textAlign: 'center', fontSize: 12, color: C.textSubtle, fontFamily: 'Manrope_400Regular', marginTop: 8 },

  // ── Empty state ──
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: S[5], gap: 12 },
  emptyIcon:  { fontSize: 44 },
  emptyTitle: { fontSize: 18, fontFamily: 'Manrope_700Bold', color: C.textPrimary, textAlign: 'center' },
  emptySub:   { fontSize: 14, fontFamily: 'Manrope_400Regular', color: C.textMuted, textAlign: 'center', lineHeight: 20 },
});
