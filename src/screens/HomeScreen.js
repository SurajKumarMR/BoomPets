import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { usePet } from '../context/PetContext';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const { pet, updatePet } = usePet();

  // Helper function to convert time string to minutes for sorting
  const timeToMinutes = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  // Helper function to get icon based on meal time
  const getMealIcon = (mealTime) => {
    switch (mealTime) {
      case 'breakfast':
        return { name: 'sunny', color: '#F5A623' };
      case 'lunch':
        return { name: 'partly-sunny', color: '#F5A623' };
      case 'dinner':
        return { name: 'moon', color: '#6B7FD7' };
      case 'snack':
        return { name: 'fast-food', color: '#2D5F4F' };
      default:
        return { name: 'restaurant', color: '#F5A623' };
    }
  };

  // Sort feeding schedule by time of day
  const sortedSchedule = pet?.feedingSchedule 
    ? [...pet.feedingSchedule].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
    : [];

  const handleRemoveAllergy = async (allergyToRemove) => {
    if (!pet) return;
    const updatedAllergies = (pet.allergies || []).filter(a => a !== allergyToRemove);
    await updatePet({ ...pet, allergies: updatedAllergies });
  };

  const handleRemoveHealthCondition = async (conditionToRemove) => {
    if (!pet) return;
    const updatedConditions = (pet.healthConditions || []).filter(c => c !== conditionToRemove);
    await updatePet({ ...pet, healthConditions: updatedConditions });
  };

  const handleAddAllergy = () => {
    // Navigate to profile screen to add allergy
    navigation.navigate('Profile');
  };

  const handleAddHealthCondition = () => {
    // Navigate to profile screen to add health condition
    navigation.navigate('Profile');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MealMaster</Text>
        <Ionicons name="notifications-outline" size={24} color="#000" />
      </View>

      <View style={styles.petCard}>
        <View style={styles.petAvatar}>
          <Ionicons name="paw" size={40} color="#F5A623" />
        </View>
        <Text style={styles.petName}>{pet?.name || 'Your Pet'}</Text>
        <Text style={styles.petInfo}>
          {pet?.breed || 'Unknown breed'} • {pet?.age || 0} years old
        </Text>
        <Text style={styles.petWeight}>Weight: {pet?.weight || 0} kg</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="pencil" size={16} color="#FFF" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="medkit" size={20} color="#F5A623" />
          <Text style={styles.sectionTitle}>Health & Allergies</Text>
        </View>
        
        {/* Allergies Section */}
        <Text style={styles.subsectionTitle}>Allergies</Text>
        {pet?.allergies && pet.allergies.length > 0 ? (
          <View style={styles.tagRow}>
            {pet.allergies.map((allergy, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{allergy}</Text>
                <TouchableOpacity onPress={() => handleRemoveAllergy(allergy)}>
                  <Ionicons name="close-circle" size={16} color="#F5A623" style={styles.tagClose} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No allergies recorded</Text>
        )}
        <TouchableOpacity onPress={handleAddAllergy}>
          <Text style={styles.addLink}>+ Add Allergy</Text>
        </TouchableOpacity>

        {/* Health Conditions Section */}
        <Text style={[styles.subsectionTitle, styles.subsectionMargin]}>Health Conditions</Text>
        {pet?.healthConditions && pet.healthConditions.length > 0 ? (
          <View style={styles.conditionsList}>
            {pet.healthConditions.map((condition, index) => (
              <View key={index} style={styles.conditionItem}>
                <Text style={styles.conditionText}>• {condition}</Text>
                <TouchableOpacity onPress={() => handleRemoveHealthCondition(condition)}>
                  <Ionicons name="trash-outline" size={16} color="#999" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No health conditions recorded</Text>
        )}
        <TouchableOpacity onPress={handleAddHealthCondition}>
          <Text style={styles.addLink}>+ Add Health Condition</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="sunny" size={20} color="#F5A623" />
          <Text style={styles.sectionTitle}>Environmental Context</Text>
        </View>
        <View style={styles.contextCard}>
          <Text style={styles.contextLabel}>CURRENT CLIMATE</Text>
          <Text style={styles.contextValue}>{pet?.climate || 'Temperate'}</Text>
          <Text style={styles.contextLabel}>Activity Level</Text>
          <Text style={styles.contextActivity}>{pet?.activityLevel ? pet.activityLevel.charAt(0).toUpperCase() + pet.activityLevel.slice(1) : 'Moderate'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="restaurant" size={20} color="#F5A623" />
          <Text style={styles.sectionTitle}>Feeding Plan</Text>
        </View>
        {sortedSchedule.length > 0 ? (
          sortedSchedule.map((schedule, index) => {
            const icon = getMealIcon(schedule.mealTime);
            return (
              <TouchableOpacity key={index} style={styles.mealCard}>
                <Ionicons name={icon.name} size={24} color={icon.color} />
                <View style={styles.mealInfo}>
                  <Text style={styles.mealTitle}>
                    {schedule.mealTime.charAt(0).toUpperCase() + schedule.mealTime.slice(1)}
                  </Text>
                  <Text style={styles.mealTime}>
                    {schedule.time} • {schedule.portionSize} {schedule.unit}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={styles.emptyText}>No feeding schedule set</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold' },
  petCard: { backgroundColor: '#FFF', margin: 20, padding: 20, borderRadius: 16, alignItems: 'center' },
  petAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F5E6D3', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  petName: { fontSize: 24, fontWeight: 'bold' },
  petInfo: { color: '#F5A623', marginTop: 5 },
  petWeight: { color: '#999', marginTop: 5 },
  editButton: { flexDirection: 'row', backgroundColor: '#F5A623', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 15, alignItems: 'center' },
  editButtonText: { color: '#FFF', marginLeft: 5, fontWeight: '600' },
  section: { backgroundColor: '#FFF', margin: 20, marginTop: 0, padding: 20, borderRadius: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
  subsectionTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  subsectionMargin: { marginTop: 20 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: { backgroundColor: '#FFF5E6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  tagText: { color: '#F5A623', fontSize: 12 },
  tagClose: { marginLeft: 6 },
  emptyText: { color: '#999', fontSize: 12, marginBottom: 8 },
  conditionsList: { marginBottom: 8 },
  conditionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  conditionText: { color: '#333', fontSize: 14, flex: 1 },
  addLink: { color: '#F5A623', marginTop: 5 },
  contextCard: { backgroundColor: '#FAF9F6', padding: 15, borderRadius: 12 },
  contextLabel: { fontSize: 11, color: '#999', marginBottom: 5 },
  contextValue: { fontSize: 18, fontWeight: '600', marginBottom: 15 },
  contextActivity: { fontSize: 16, color: '#F5A623', fontWeight: '600' },
  mealCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAF9F6', padding: 15, borderRadius: 12, marginBottom: 10 },
  mealInfo: { flex: 1, marginLeft: 12 },
  mealTitle: { fontSize: 16, fontWeight: '600' },
  mealTime: { color: '#999', marginTop: 2 },
});
