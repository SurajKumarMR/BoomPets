import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { usePet } from '../context/PetContext';
import { getMealRecommendations } from '../utils/nutritionCalculator';
import { Ionicons } from '@expo/vector-icons';

export default function NutritionScreen({ navigation }) {
  const { pet } = usePet();
  const meals = getMealRecommendations(pet);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>AI Food Suggestions</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.planHeader}>
        <View style={styles.avatar}>
          <Ionicons name="paw" size={40} color="#F5A623" />
        </View>
        <Text style={styles.planTitle}>{pet?.name}'s Nutrition Plan</Text>
        <Text style={styles.planSubtitle}>
          Adult {pet?.breed} • {pet?.weight}kg • Active
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>AI GENERATED TODAY</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended Meals</Text>
          <Text style={styles.suggestions}>2 suggestions</Text>
        </View>

        {meals.map((meal) => (
          <View key={meal.id} style={styles.mealCard}>
            <View style={styles.mealImage}>
              <Ionicons name="restaurant" size={60} color="#F5A623" />
            </View>
            <View style={styles.mealBadge}>
              <Text style={styles.mealBadgeText}>{meal.type}</Text>
            </View>
            <Text style={styles.mealName}>{meal.name}</Text>
            <Text style={styles.mealDescription}>{meal.description}</Text>
            <Text style={styles.ingredientsTitle}>INGREDIENTS</Text>
            <Text style={styles.ingredients}>{meal.ingredients.join(', ')}</Text>
            <TouchableOpacity style={styles.selectButton}>
              <Text style={styles.selectButtonText}>Select Meal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.favoriteButton}>
              <Ionicons name="heart-outline" size={24} color="#F5A623" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.saveButton}>
        <Ionicons name="bookmark" size={20} color="#FFF" />
        <Text style={styles.saveButtonText}>Save Plan to Profile</Text>
      </TouchableOpacity>

      <View style={styles.resources}>
        <Text style={styles.resourcesTitle}>PROFESSIONAL RESOURCES</Text>
        <TouchableOpacity style={styles.resourceItem}>
          <Ionicons name="book" size={20} color="#F5A623" />
          <Text style={styles.resourceText}>Pet Nutrition Guide 2024</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.resourceItem}>
          <Ionicons name="location" size={20} color="#F5A623" />
          <Text style={styles.resourceText}>Find a Local Specialist</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  title: { fontSize: 18, fontWeight: 'bold' },
  planHeader: { alignItems: 'center', padding: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2D5F4F', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  planTitle: { fontSize: 22, fontWeight: 'bold' },
  planSubtitle: { color: '#999', marginTop: 5 },
  badge: { backgroundColor: '#FFF5E6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 10 },
  badgeText: { color: '#F5A623', fontSize: 11, fontWeight: '600' },
  section: { padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  suggestions: { color: '#F5A623' },
  mealCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 20 },
  mealImage: { width: '100%', height: 150, backgroundColor: '#F5E6D3', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  mealBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 10 },
  mealBadgeText: { color: '#4CAF50', fontSize: 11, fontWeight: '600' },
  mealName: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  mealDescription: { color: '#666', marginBottom: 15 },
  ingredientsTitle: { fontSize: 11, color: '#999', fontWeight: '600', marginBottom: 5 },
  ingredients: { color: '#666', fontSize: 13, lineHeight: 20 },
  selectButton: { backgroundColor: '#F5A623', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  selectButtonText: { color: '#FFF', fontWeight: '600' },
  favoriteButton: { position: 'absolute', top: 20, right: 20 },
  saveButton: { flexDirection: 'row', backgroundColor: '#F5A623', margin: 20, padding: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { color: '#FFF', fontWeight: '600', marginLeft: 8 },
  resources: { padding: 20 },
  resourcesTitle: { fontSize: 11, color: '#999', fontWeight: '600', marginBottom: 15 },
  resourceItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 10 },
  resourceText: { flex: 1, marginLeft: 12, fontWeight: '500' },
});
