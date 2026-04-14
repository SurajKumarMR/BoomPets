import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { usePet } from '../context/PetContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingScreen({ navigation }) {
  const { createPet } = usePet();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [animalType, setAnimalType] = useState('dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!name.trim()) {
      newErrors.name = 'Pet name is required';
    }

    // Validate age
    if (!age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(age) || parseFloat(age) <= 0) {
      newErrors.age = 'Age must be greater than 0';
    }

    // Validate weight
    if (!weight.trim()) {
      newErrors.weight = 'Weight is required';
    } else if (isNaN(weight) || parseFloat(weight) <= 0) {
      newErrors.weight = 'Weight must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const petData = {
        userId: user?.id,
        name,
        animalType,
        breed,
        age: parseFloat(age),
        weight: parseFloat(weight),
      };

      const result = await createPet(petData);

      if (result.success) {
        navigation.replace('Main');
      } else {
        Alert.alert('Error', result.error || 'Failed to create pet profile');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pet Profile</Text>
        <Text style={styles.step}>Step 1 of 4</Text>
      </View>

      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>

      <View style={styles.photoSection}>
        <View style={styles.photoCircle}>
          <Ionicons name="camera" size={32} color="#F5A623" />
        </View>
        <Text style={styles.photoTitle}>Add a photo</Text>
        <Text style={styles.photoSubtitle}>Help us recognize your furry friend</Text>
      </View>

      <Text style={styles.label}>Pet Name</Text>
      <TextInput
        style={[styles.input, errors.name && styles.inputError]}
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (errors.name) {
            setErrors({ ...errors, name: undefined });
          }
        }}
        placeholder="Cooper"
      />
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      <Text style={styles.label}>Animal Type</Text>
      <View style={styles.typeRow}>
        {[
          { type: 'dog', icon: 'paw' },
          { type: 'cat', icon: 'paw' },
          { type: 'bird', icon: 'leaf' },
          { type: 'fish', icon: 'fish' }
        ].map(({ type, icon }) => (
          <TouchableOpacity
            key={type}
            style={[styles.typeButton, animalType === type && styles.typeButtonActive]}
            onPress={() => setAnimalType(type)}
          >
            <Ionicons name={icon} size={24} color={animalType === type ? '#F5A623' : '#666'} />
            <Text style={[styles.typeText, animalType === type && styles.typeTextActive]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Breed</Text>
      <TextInput
        style={styles.input}
        value={breed}
        onChangeText={setBreed}
        placeholder="e.g. Golden Retriever"
      />

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Text style={styles.label}>Age (years)</Text>
          <TextInput
            style={[styles.input, errors.age && styles.inputError]}
            value={age}
            onChangeText={(text) => {
              setAge(text);
              if (errors.age) {
                setErrors({ ...errors, age: undefined });
              }
            }}
            placeholder="3"
            keyboardType="numeric"
          />
          {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
        </View>
        <View style={styles.halfInput}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={[styles.input, errors.weight && styles.inputError]}
            value={weight}
            onChangeText={(text) => {
              setWeight(text);
              if (errors.weight) {
                setErrors({ ...errors, weight: undefined });
              }
            }}
            placeholder="12.5"
            keyboardType="numeric"
          />
          {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleContinue}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold' },
  step: { color: '#F5A623', fontSize: 14 },
  progressBar: { height: 8, backgroundColor: '#E5E5E5', borderRadius: 4, marginVertical: 20 },
  progressFill: { width: '25%', height: '100%', backgroundColor: '#F5A623', borderRadius: 4 },
  photoSection: { alignItems: 'center', marginVertical: 30 },
  photoCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#F5E6D3', justifyContent: 'center', alignItems: 'center' },
  photoTitle: { fontSize: 18, fontWeight: '600', marginTop: 15 },
  photoSubtitle: { color: '#999', marginTop: 5 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 15, marginBottom: 8 },
  input: { backgroundColor: '#FFF', padding: 15, borderRadius: 8, fontSize: 16 },
  typeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  typeButton: { flex: 1, padding: 15, backgroundColor: '#FFF', borderRadius: 8, alignItems: 'center', marginHorizontal: 4, borderWidth: 2, borderColor: '#FFF' },
  typeButtonActive: { borderColor: '#F5A623' },
  typeText: { marginTop: 5, fontSize: 12, color: '#666' },
  typeTextActive: { color: '#F5A623', fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { flex: 1, marginHorizontal: 4 },
  button: { backgroundColor: '#F5A623', padding: 18, borderRadius: 12, alignItems: 'center', marginVertical: 30 },
  buttonDisabled: { backgroundColor: '#CCC' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  inputError: { borderWidth: 1, borderColor: '#FF3B30' },
  errorText: { color: '#FF3B30', fontSize: 12, marginTop: 4, marginLeft: 4 },
});
