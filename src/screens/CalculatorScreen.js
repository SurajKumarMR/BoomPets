import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { calculatePortionSize, calculateDailyCalories, calculateHydration } from '../utils/nutritionCalculator';
import { Ionicons } from '@expo/vector-icons';

export default function CalculatorScreen() {
  const [weight, setWeight] = useState('12.5');
  const portionSize = calculatePortionSize(parseFloat(weight) || 0);
  const calories = calculateDailyCalories(parseFloat(weight) || 0, 4);
  const hydration = calculateHydration(parseFloat(weight) || 0);

  const handleWeightChange = (value) => {
    setWeight(value.toFixed(1));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Portion Calculator</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="paw" size={40} color="#F5A623" />
        </View>
      </View>

      <Text style={styles.mainTitle}>Daily Meal Size</Text>
      <Text style={styles.subtitle}>
        Enter your pet's current weight to find the perfect portion size for a healthy life.
      </Text>

      <Text style={styles.label}>Pet Weight (kg)</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />
        <Text style={styles.unit}>kg</Text>
      </View>

      <View style={styles.slider}>
        <Slider
          style={styles.sliderTrack}
          minimumValue={1}
          maximumValue={100}
          value={parseFloat(weight) || 12.5}
          onValueChange={handleWeightChange}
          minimumTrackTintColor="#F5A623"
          maximumTrackTintColor="#E5E5E5"
          thumbTintColor="#F5A623"
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>SMALL (1KG)</Text>
          <Text style={styles.sliderLabel}>LARGE (100KG)</Text>
        </View>
      </View>

      <View style={styles.resultCard}>
        <Text style={styles.resultLabel}>RECOMMENDED PORTION</Text>
        <Text style={styles.resultValue}>{portionSize} <Text style={styles.resultUnit}>grams / day</Text></Text>
        <View style={styles.resultDetail}>
          <Text style={styles.resultDetailText}>2 meals per day</Text>
          <Text style={styles.resultDetailValue}>{Math.round(portionSize / 2)}g / meal</Text>
          <TouchableOpacity>
            <Ionicons name="information-circle-outline" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="flash" size={24} color="#F5A623" />
          <Text style={styles.statLabel}>CALORIES</Text>
          <Text style={styles.statValue}>{calories} <Text style={styles.statUnit}>kcal</Text></Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="water" size={24} color="#6B7FD7" />
          <Text style={styles.statLabel}>HYDRATION</Text>
          <Text style={styles.statValue}>{hydration} <Text style={styles.statUnit}>ml</Text></Text>
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save to Pet Profile</Text>
        <Ionicons name="chevron-forward" size={20} color="#FFF" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  title: { fontSize: 18, fontWeight: 'bold' },
  iconContainer: { alignItems: 'center', marginVertical: 20 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF5E6', justifyContent: 'center', alignItems: 'center' },
  mainTitle: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { color: '#666', textAlign: 'center', paddingHorizontal: 40, marginTop: 10, marginBottom: 30 },
  label: { fontSize: 14, fontWeight: '600', paddingHorizontal: 20, marginBottom: 10 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 20, paddingHorizontal: 20, paddingVertical: 15, borderRadius: 12 },
  input: { flex: 1, fontSize: 24, fontWeight: 'bold', color: '#F5A623' },
  unit: { fontSize: 16, color: '#999' },
  slider: { paddingHorizontal: 20, marginVertical: 20 },
  sliderTrack: { width: '100%', height: 40 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  sliderLabel: { fontSize: 11, color: '#999' },
  resultCard: { backgroundColor: '#F5A623', marginHorizontal: 20, padding: 25, borderRadius: 16, marginBottom: 20 },
  resultLabel: { color: '#FFF', fontSize: 12, fontWeight: '600', opacity: 0.9 },
  resultValue: { color: '#FFF', fontSize: 48, fontWeight: 'bold', marginVertical: 10 },
  resultUnit: { fontSize: 20, fontWeight: 'normal' },
  resultDetail: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 8, marginTop: 10 },
  resultDetailText: { flex: 1, color: '#FFF', fontSize: 14 },
  resultDetailValue: { color: '#FFF', fontSize: 14, fontWeight: '600', marginRight: 10 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#FFF', padding: 20, borderRadius: 12, marginHorizontal: 5, alignItems: 'center' },
  statLabel: { fontSize: 11, color: '#999', fontWeight: '600', marginTop: 10 },
  statValue: { fontSize: 24, fontWeight: 'bold', marginTop: 5 },
  statUnit: { fontSize: 14, fontWeight: 'normal' },
  saveButton: { flexDirection: 'row', backgroundColor: '#F5A623', marginHorizontal: 20, padding: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600', marginRight: 8 },
});
