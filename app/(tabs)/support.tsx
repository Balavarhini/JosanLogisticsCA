import React, { useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "@constants/theme";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";

const FAQS = [
  {
    question: "How do I track my shipment?",
    answer: "Go to the Shipments tab and enter your tracking ID (e.g. JSN123456789IN) in the search bar at the top.",
  },
  {
    question: "How is the delivery rate calculated?",
    answer: "The Rate Calculator estimates cost from the route, weight, and shipment type. Final charges may vary slightly based on actual weight and dimensions.",
  },
  {
    question: "Can I change the pickup or delivery address after booking?",
    answer: "Address changes after a shipment is booked need to go through Contact Us below — our support team can update it before pickup.",
  },
  {
    question: "What if my package is delayed?",
    answer: "Check the Recent Tracking timeline on the Shipments tab for the latest status, or contact us if it hasn't updated in over 24 hours.",
  },
];

/** Support tab — Help Centre (FAQ accordion) + direct contact options. */
export default function SupportScreen() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <View style={styles.flex}>
      <Header variant="title" title="Help & Support" leftAction="menu" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.contactCard}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Pressable style={styles.contactRow} onPress={() => Linking.openURL("tel:+6567890123")} accessibilityRole="button">
            <Ionicons name="call" size={18} color={colors.primary} />
            <Text style={styles.contactText}>+65 6789 0123</Text>
          </Pressable>
          <Pressable
            style={styles.contactRow}
            onPress={() => Linking.openURL("mailto:support@josanlogistics.com")}
            accessibilityRole="button"
          >
            <Ionicons name="mail" size={18} color={colors.primary} />
            <Text style={styles.contactText}>support@josanlogistics.com</Text>
          </Pressable>
          <Pressable style={styles.contactRow} accessibilityRole="button">
            <Ionicons name="chatbubble-ellipses" size={18} color={colors.primary} />
            <Text style={styles.contactText}>Live Chat</Text>
          </Pressable>
        </Card>

        <Text style={styles.sectionTitle}>FAQs</Text>
        <Card style={styles.faqCard}>
          {FAQS.map((faq, index) => {
            const isOpen = expanded === index;
            return (
              <View key={faq.question}>
                <Pressable
                  style={styles.faqRow}
                  onPress={() => setExpanded(isOpen ? null : index)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isOpen }}
                >
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={colors.textMuted} />
                </Pressable>
                {isOpen ? <Text style={styles.faqAnswer}>{faq.answer}</Text> : null}
                {index < FAQS.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            );
          })}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  sectionTitle: { fontFamily: typography.fontFamily.headingBold, fontSize: typography.h3.fontSize, color: colors.textPrimary },
  contactCard: { gap: spacing.sm + 2 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm + 2 },
  contactText: { fontFamily: typography.fontFamily.bodyBold, fontSize: typography.bodySmall.fontSize, color: colors.textPrimary },
  faqCard: { padding: 0, overflow: "hidden" },
  faqRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  faqQuestion: { flex: 1, fontFamily: typography.fontFamily.bodyBold, fontSize: typography.bodySmall.fontSize, color: colors.textPrimary },
  faqAnswer: {
    fontFamily: typography.fontFamily.bodyRegular,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
});
