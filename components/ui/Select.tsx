import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../lib/theme';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  value?: string | null;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
}

export function Select({ label, placeholder = 'Select an option', value, options, onChange, error }: SelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable style={[styles.trigger, error && styles.triggerError]} onPress={() => setOpen(true)}>
        <Text style={selected ? styles.triggerText : styles.placeholder}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.gray500} />
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label || 'Select'}</Text>
              <Pressable onPress={() => setOpen(false)}>
                <Ionicons name="close" size={22} color={colors.gray700} />
              </Pressable>
            </View>
            <ScrollView>
              {options.map((opt) => {
                const active = opt.value === value;
                return (
                  <Pressable
                    key={opt.value}
                    style={[styles.option, active && styles.optionActive]}
                    onPress={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>{opt.label}</Text>
                    {active ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  label: { ...typography.caption, color: colors.gray700, marginBottom: spacing.xs, fontWeight: '600' },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  triggerError: { borderColor: colors.danger },
  triggerText: { ...typography.body, color: colors.gray900 },
  placeholder: { ...typography.body, color: colors.gray400 },
  errorText: { ...typography.caption, color: colors.danger, marginTop: spacing.xs },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '70%',
    paddingBottom: spacing.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  sheetTitle: { ...typography.h3, color: colors.gray900 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
  },
  optionActive: { backgroundColor: colors.primarySoft },
  optionText: { ...typography.body, color: colors.gray800 },
  optionTextActive: { color: colors.primary, fontWeight: '600' },
});
