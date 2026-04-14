import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { usePet } from '../context/PetContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }) {
  const { pet } = usePet();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>MealMaster</Text>
        <Ionicons name="notifications-outline" size={24} color="#000" />
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="paw" size={40} color="#F5A623" />
        </View>
        <Text style={styles.petName}>{pet?.name || 'Cooper'}</Text>
        <Text style={styles.petInfo}>{pet?.breed || 'Beagle'} • {pet?.age || 4} years old</Text>
        <Text style={styles.petWeight}>Weight: {pet?.weight || 25} lbs</Text>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="pencil" size={16} color="#FFF" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="medkit" size={20} color="#F5A623" />
          <Text style={styles.sectionTitle}>Health & Allergies</Text>
        </View>
        <View style={styles.tagRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Grain-free</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Sensitive skin</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Text style={styles.addLink}>+ Add Allergy</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="sunny" size={20} color="#F5A623" />
          <Text style={styles.sectionTitle}>Environmental Context</Text>
        </View>
        <View style={styles.contextRow}>
          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>CURRENT CLIMATE</Text>
            <Text style={styles.contextValue}>Temperate</Text>
          </View>
          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>Activity Level</Text>
            <Text style={styles.contextActivity}>Moderate</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="restaurant" size={20} color="#F5A623" />
          <Text style={styles.sectionTitle}>Feeding Plan</Text>
        </View>
        <TouchableOpacity style={styles.mealCard}>
          <Ionicons name="sunny" size={24} color="#F5A623" />
          <View style={styles.mealInfo}>
            <Text style={styles.mealTitle}>Breakfast</Text>
            <Text style={styles.mealTime}>8:00 AM • 1.5 cups</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mealCard}>
          <Ionicons name="moon" size={24} color="#6B7FD7" />
          <View style={styles.mealInfo}>
            <Text style={styles.mealTitle}>Dinner</Text>
            <Text style={styles.mealTime}>6:00 PM • 1.25 cups</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold' },
  profileCard: { backgroundColor: '#FFF', margin: 20, padding: 20, borderRadius: 16, alignItems: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  petName: { fontSize: 28, fontWeight: 'bold' },
  petInfo: { color: '#F5A623', marginTop: 5, fontSize: 16 },
  petWeight: { color: '#999', marginTop: 5 },
  editButton: { flexDirection: 'row', backgroundColor: '#F5A623', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 12, marginTop: 20, alignItems: 'center' },
  editButtonText: { color: '#FFF', marginLeft: 5, fontWeight: '600', fontSize: 15 },
  section: { backgroundColor: '#FFF', margin: 20, marginTop: 0, padding: 20, borderRadius: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: { backgroundColor: '#FFF5E6', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, marginRight: 10, marginBottom: 10 },
  tagText: { color: '#F5A623', fontSize: 13 },
  addLink: { color: '#F5A623', marginTop: 5, fontSize: 14 },
  contextRow: { flexDirection: 'row', backgroundColor: '#FAF9F6', padding: 15, borderRadius: 12 },
  contextItem: { flex: 1 },
  contextLabel: { fontSize: 11, color: '#999', marginBottom: 5 },
  contextValue: { fontSize: 16, fontWeight: '600' },
  contextActivity: { fontSize: 16, color: '#F5A623', fontWeight: '600' },
  mealCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAF9F6', padding: 15, borderRadius: 12, marginBottom: 10 },
  mealInfo: { flex: 1, marginLeft: 12 },
  mealTitle: { fontSize: 16, fontWeight: '600' },
  mealTime: { color: '#999', marginTop: 2, fontSize: 13 },
});
