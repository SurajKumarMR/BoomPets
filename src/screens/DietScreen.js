import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DietScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Diet Management</Text>
        <Ionicons name="search" size={24} color="#000" />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={styles.tabActive}>
          <Text style={styles.tabTextActive}>Saved Plans</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Diet History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Nutrition Plan</Text>
          <View style={styles.currentBadge}>
            <Text style={styles.currentBadgeText}>CURRENT</Text>
          </View>
        </View>

        <View style={styles.planCard}>
          <View style={styles.planImage}>
            <Ionicons name="nutrition" size={40} color="#2D5F4F" />
          </View>
          <View style={styles.planInfo}>
            <Text style={styles.planName}>Muscle Building Mix</Text>
            <Text style={styles.planDescription}>High protein, Beef & Spinach</Text>
            <View style={styles.planMeta}>
              <Ionicons name="calendar" size={14} color="#F5A623" />
              <Text style={styles.planMetaText}>Started Oct 12 • Week 2/4</Text>
            </View>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommended for You</Text>

        <View style={styles.recommendCard}>
          <View style={styles.recommendInfo}>
            <Text style={styles.recommendName}>Digestive Care Gold</Text>
            <Text style={styles.recommendDescription}>Low fat, Prebiotic rich • 6 weeks</Text>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add-circle" size={20} color="#F5A623" />
              <Text style={styles.addButtonText}>Add Plan</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recommendImage}>
            <Ionicons name="paw" size={40} color="#F5A623" />
          </View>
        </View>

        <View style={styles.recommendCard}>
          <View style={styles.recommendInfo}>
            <Text style={styles.recommendName}>Weight Management</Text>
            <Text style={styles.recommendDescription}>Controlled calorie, High fiber • 12 weeks</Text>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add-circle" size={20} color="#F5A623" />
              <Text style={styles.addButtonText}>Add Plan</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recommendImage}>
            <Ionicons name="leaf" size={40} color="#4CAF50" />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent History</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historyItem}>
          <View style={styles.historyIcon}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          </View>
          <View style={styles.historyInfo}>
            <Text style={styles.historyTitle}>Breakfast Completed</Text>
            <Text style={styles.historyTime}>Today, 8:30 AM</Text>
          </View>
          <Text style={styles.historyCalories}>250 kcal</Text>
        </View>

        <View style={styles.historyItem}>
          <View style={styles.historyIcon}>
            <Ionicons name="time" size={24} color="#999" />
          </View>
          <View style={styles.historyInfo}>
            <Text style={styles.historyTitle}>Dinner (Scheduled)</Text>
            <Text style={styles.historyTime}>Today, 6:00 PM</Text>
          </View>
          <Text style={styles.historyCalories}>300 kcal</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold' },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#F5A623' },
  tabText: { color: '#999' },
  tabTextActive: { color: '#F5A623', fontWeight: '600' },
  section: { backgroundColor: '#FFF', margin: 20, marginTop: 0, padding: 20, borderRadius: 16, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  currentBadge: { backgroundColor: '#FFF5E6', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  currentBadgeText: { color: '#F5A623', fontSize: 11, fontWeight: '600' },
  planCard: { flexDirection: 'row', alignItems: 'center' },
  planImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#2D5F4F', justifyContent: 'center', alignItems: 'center' },
  planInfo: { flex: 1, marginLeft: 15 },
  planName: { fontSize: 16, fontWeight: '600' },
  planDescription: { color: '#666', marginTop: 5 },
  planMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  planMetaText: { color: '#F5A623', fontSize: 12, marginLeft: 5 },
  progressBar: { height: 8, backgroundColor: '#E5E5E5', borderRadius: 4, marginTop: 15 },
  progressFill: { width: '50%', height: '100%', backgroundColor: '#F5A623', borderRadius: 4 },
  recommendCard: { flexDirection: 'row', backgroundColor: '#FAF9F6', padding: 15, borderRadius: 12, marginBottom: 15 },
  recommendInfo: { flex: 1 },
  recommendName: { fontSize: 16, fontWeight: '600' },
  recommendDescription: { color: '#666', marginTop: 5, fontSize: 13 },
  addButton: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  addButtonText: { color: '#F5A623', marginLeft: 5, fontWeight: '600' },
  recommendImage: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  viewAll: { color: '#F5A623', fontSize: 14 },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  historyIcon: { marginRight: 12 },
  historyInfo: { flex: 1 },
  historyTitle: { fontSize: 15, fontWeight: '600' },
  historyTime: { color: '#999', fontSize: 13, marginTop: 2 },
  historyCalories: { fontSize: 15, fontWeight: '600' },
});
