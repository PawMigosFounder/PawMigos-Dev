import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors } from '../../lib/theme';

interface ScreenProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: Edge[];
  unsafe?: boolean;
}

export function Screen({ children, style, edges, unsafe }: ScreenProps) {
  if (unsafe) {
    return <View style={[styles.root, style]}>{children}</View>;
  }
  return (
    <SafeAreaView style={[styles.root, style]} edges={edges ?? ['top', 'bottom']}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
