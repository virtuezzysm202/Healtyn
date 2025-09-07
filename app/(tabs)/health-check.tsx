import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import LansiaText from '../../components/ui/LansiaText';
import { useTranslation } from '../../hooks/useTranslation';

interface Symptom {
  id: string;
  name: string;
  severity: number; // 1-5 scale
  notes: string;
  date: string;
}

interface VitalSigns {
  bloodPressure: { systolic: string; diastolic: string };
  heartRate: string;
  temperature: string;
  bloodSugar: string;
}

interface NutritionRecommendation {
  bmiCategory: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  tips: string[];
  foods: string[];
}

export default function HealthCalculatorScreen() {
  const { t } = useTranslation();

  // BMI Calculator States
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active'>('light');
  const [bmiResult, setBmiResult] = useState<number | null>(null);
  const [waterResult, setWaterResult] = useState<number | null>(null);
  const [nutritionRec, setNutritionRec] = useState<NutritionRecommendation | null>(null);

  // Symptom Tracker States
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [newSymptom, setNewSymptom] = useState({ name: '', severity: 1, notes: '' });

  // Vital Signs States
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
    bloodPressure: { systolic: '', diastolic: '' },
    heartRate: '',
    temperature: '',
    bloodSugar: ''
  });

  // Active Tab State
  const [activeTab, setActiveTab] = useState<'calculator' | 'symptoms' | 'vitals'>('calculator');

  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    const ageNum = parseFloat(age);
    

    if (!w || !h || !ageNum || w <= 0 || h <= 0 || ageNum <= 0) {
      Alert.alert(t('error'), t('health.invalidInput'));
      return;
    }
    
  
    if (w < 20 || w > 300) {
      Alert.alert(t('error'), 'Weight should be between 20-300 kg');
      return;
    }
    
    if (parseFloat(height) < 100 || parseFloat(height) > 250) {
      Alert.alert(t('error'), 'Height should be between 100-250 cm');
      return;
    }
    
    if (ageNum < 1 || ageNum > 120) {
      Alert.alert(t('error'), 'Age should be between 1-120 years');
      return;
    }
    
    const bmi = w / (h * h);
    setBmiResult(parseFloat(bmi.toFixed(1)));
  
    const water = w * 35;
    setWaterResult(Math.round(water));
  
    const nutrition = calculateNutrition(bmi, w, ageNum, gender, activityLevel);
    setNutritionRec(nutrition);
  };

  const validateVitalSigns = () => {
    const { systolic, diastolic } = vitalSigns.bloodPressure;
    let hasData = false;
    let warnings = [];
    let errors = [];
  
    // Validasi Blood Pressure
    if (systolic || diastolic) {
      hasData = true;
      
      if (!systolic || !diastolic) {
        errors.push('Both systolic and diastolic pressure are required');
      } else {
        const sys = parseFloat(systolic);
        const dia = parseFloat(diastolic);
        
        if (isNaN(sys) || isNaN(dia)) {
          errors.push('Blood pressure values must be numbers');
        } else if (sys <= dia) {
          errors.push('Systolic pressure must be higher than diastolic');
        } else {
          // Validasi range normal
          if (sys < 70 || sys > 200) {
            warnings.push('Systolic pressure seems unusual (normal: 90-140)');
          }
          if (dia < 40 || dia > 120) {
            warnings.push('Diastolic pressure seems unusual (normal: 60-90)');
          }
        }
      }
    }
  
    // Validasi Heart Rate
    if (vitalSigns.heartRate) {
      hasData = true;
      const hr = parseFloat(vitalSigns.heartRate);
      if (isNaN(hr)) {
        errors.push('Heart rate must be a number');
      } else if (hr < 30 || hr > 220) {
        warnings.push('Heart rate seems unusual (normal: 60-100 bpm)');
      }
    }
  
    // Validasi Temperature
    if (vitalSigns.temperature) {
      hasData = true;
      const temp = parseFloat(vitalSigns.temperature);
      if (isNaN(temp)) {
        errors.push('Temperature must be a number');
      } else if (temp < 30 || temp > 45) {
        warnings.push('Temperature seems unusual (normal: 36.1-37.2°C)');
      }
    }
  
    // Validasi Blood Sugar
    if (vitalSigns.bloodSugar) {
      hasData = true;
      const bs = parseFloat(vitalSigns.bloodSugar);
      if (isNaN(bs)) {
        errors.push('Blood sugar must be a number');
      } else if (bs < 30 || bs > 500) {
        warnings.push('Blood sugar seems unusual (normal: 70-140 mg/dL)');
      }
    }
  
    // Tampilkan hasil validasi
    if (!hasData) {
      Alert.alert('Info', 'Please enter some vital signs data to validate');
      return;
    }
  
    if (errors.length > 0) {
      Alert.alert('Error', errors.join('\n'));
      return;
    }
  
    if (warnings.length > 0) {
      Alert.alert('Warning', warnings.join('\n'));
      return;
    }
  
    Alert.alert('Success', 'All vital signs look normal!');
  };

 const calculateNutrition = (
  bmi: number, 
  weight: number, 
  age: number, 
  gender: 'male' | 'female', 
  activity: 'sedentary' | 'light' | 'moderate' | 'active'
): NutritionRecommendation => {
  const heightCm = parseFloat(height);
  
  let bmr = 0;
  if (gender === 'male') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * heightCm) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * heightCm) - (4.330 * age);
  }

  

    // Activity multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725
    };

    const calories = Math.round(bmr * activityMultipliers[activity]);
    
    // Protein: 0.8-1.2g per kg body weight
    let proteinPerKg = 0.8;
    if (bmi < 18.5) proteinPerKg = 1.2; // Underweight needs more protein
    if (bmi > 25) proteinPerKg = 1.0; // Overweight needs moderate protein
    
    const protein = Math.round(weight * proteinPerKg);
    const carbs = Math.round((calories * 0.45) / 4); // 45% of calories from carbs
    const fats = Math.round((calories * 0.30) / 9); // 30% of calories from fats

    // BMI-based recommendations
    let bmiCategory = '';
    let tips: string[] = [];
    let foods: string[] = [];

    if (bmi < 18.5) {
      bmiCategory = 'underweight';
      tips = [
        'health.nutrition.tips.underweight.gainWeight',
        'health.nutrition.tips.underweight.frequentMeals',
        'health.nutrition.tips.underweight.healthyFats',
        'health.nutrition.tips.underweight.strengthTraining'
      ];
      foods = [
        'health.nutrition.foods.underweight.nuts',
        'health.nutrition.foods.underweight.avocado',
        'health.nutrition.foods.underweight.salmon',
        'health.nutrition.foods.underweight.eggs',
        'health.nutrition.foods.underweight.oats'
      ];
    } else if (bmi < 25) {
      bmiCategory = 'normal';
      tips = [
        'health.nutrition.tips.normal.maintainWeight',
        'health.nutrition.tips.normal.balancedDiet',
        'health.nutrition.tips.normal.regularExercise',
        'health.nutrition.tips.normal.hydration'
      ];
      foods = [
        'health.nutrition.foods.normal.vegetables',
        'health.nutrition.foods.normal.fruits',
        'health.nutrition.foods.normal.wholeGrains',
        'health.nutrition.foods.normal.leanProtein',
        'health.nutrition.foods.normal.dairy'
      ];
    } else if (bmi < 30) {
      bmiCategory = 'overweight';
      tips = [
        'health.nutrition.tips.overweight.portionControl',
        'health.nutrition.tips.overweight.increaseFiber',
        'health.nutrition.tips.overweight.limitProcessed',
        'health.nutrition.tips.overweight.regularCardio'
      ];
      foods = [
        'health.nutrition.foods.overweight.leafyGreens',
        'health.nutrition.foods.overweight.berries',
        'health.nutrition.foods.overweight.chicken',
        'health.nutrition.foods.overweight.quinoa',
        'health.nutrition.foods.overweight.beans'
      ];
    } else {
      bmiCategory = 'obese';
      tips = [
        'health.nutrition.tips.obese.calorieDeficit',
        'health.nutrition.tips.obese.highFiber',
        'health.nutrition.tips.obese.limitSugar',
        'health.nutrition.tips.obese.consultDoctor'
      ];
      foods = [
        'health.nutrition.foods.obese.broccoli',
        'health.nutrition.foods.obese.fish',
        'health.nutrition.foods.obese.brownRice',
        'health.nutrition.foods.obese.tofu',
        'health.nutrition.foods.obese.cucumber'
      ];
    }

    return {
      bmiCategory,
      calories,
      protein,
      carbs,
      fats,
      tips,
      foods
    };
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: t('health.bmiCategories.underweight'), color: '#FF9500' };
    if (bmi < 25) return { category: t('health.bmiCategories.normal'), color: '#34C759' };
    if (bmi < 30) return { category: t('health.bmiCategories.overweight'), color: '#FF9500' };
    return { category: t('health.bmiCategories.obese'), color: '#FF3B30' };
  };

  const addSymptom = () => {
    if (!newSymptom.name.trim()) {
      Alert.alert(t('error'), t('health.symptoms.nameRequired'));
      return;
    }

    const symptom: Symptom = {
      id: Date.now().toString(),
      name: newSymptom.name,
      severity: newSymptom.severity,
      notes: newSymptom.notes,
      date: new Date().toLocaleDateString()
    };

    setSymptoms([symptom, ...symptoms]);
    setNewSymptom({ name: '', severity: 1, notes: '' });
    setShowSymptomModal(false);
  };

  const removeSymptom = (id: string) => {
    setSymptoms(symptoms.filter(s => s.id !== id));
  };

  const getSeverityColor = (severity: number) => {
    const colors = ['#34C759', '#32D74B', '#FF9500', '#FF6B35', '#FF3B30'];
    return colors[severity - 1];
  };

  const getVitalStatus = (type: string, value: string) => {
    const val = parseFloat(value);
    if (!val) return { status: t('health.vitals.status.unknown'), color: '#8E8E93' };
  
    switch (type) {
      case 'heartRate':
        if (val < 60) return { status: t('health.vitals.status.low'), color: '#FF9500' };
        if (val > 100) return { status: t('health.vitals.status.high'), color: '#FF3B30' };
        return { status: t('health.vitals.status.normal'), color: '#34C759' };
  
      case 'temperature':
        if (val < 36.1) return { status: t('health.vitals.status.low'), color: '#007AFF' };
        if (val > 37.2) return { status: t('health.vitals.status.high'), color: '#FF3B30' };
        return { status: t('health.vitals.status.normal'), color: '#34C759' };
  
      case 'bloodSugar':
        if (val < 70) return { status: t('health.vitals.status.low'), color: '#FF3B30' };
        if (val > 140) return { status: t('health.vitals.status.high'), color: '#FF3B30' };
        return { status: t('health.vitals.status.normal'), color: '#34C759' };
  
      case 'systolic':
        if (val < 90) return { status: t('health.vitals.status.low'), color: '#FF9500' };
        if (val > 140) return { status: t('health.vitals.status.high'), color: '#FF3B30' };
        return { status: t('health.vitals.status.normal'), color: '#34C759' };
  
      case 'diastolic':
        if (val < 60) return { status: t('health.vitals.status.low'), color: '#FF9500' };
        if (val > 90) return { status: t('health.vitals.status.high'), color: '#FF3B30' };
        return { status: t('health.vitals.status.normal'), color: '#34C759' };
  
      default:
        return { status: t('health.vitals.status.unknown'), color: '#8E8E93' };
    }
  };

  const renderTabButton = (tab: typeof activeTab, icon: string, labelKey: string) => (
    <Pressable
      style={[styles.tabButton, activeTab === tab && styles.activeTab]}
      onPress={() => setActiveTab(tab)}
    >
      <Feather name={icon as any} size={20} color={activeTab === tab ? '#007AFF' : '#8E8E93'} />
      <LansiaText style={[styles.tabLabel, activeTab === tab && styles.activeTabLabel]}>
        {t(`health.tabs.${labelKey}`)}
      </LansiaText>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton('calculator', 'calculator', 'calculator')}
        {renderTabButton('symptoms', 'activity', 'symptoms')}
        {renderTabButton('vitals', 'heart', 'vitals')}
      </View>

      <ScrollView 
        style={[styles.container]}
        contentContainerStyle={{ paddingBottom: 100, padding: 20 }}
      >
        {/* BMI Calculator Tab */}
        {activeTab === 'calculator' && (
          <View>
            <LansiaText style={styles.title}>{t('health.title')}</LansiaText>

            <View style={styles.inputGroup}>
              <LansiaText style={styles.label}>{t('health.weight')}</LansiaText>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
                placeholder={t('health.placeholders.weight')}
              />
            </View>

            <View style={styles.inputGroup}>
              <LansiaText style={styles.label}>{t('health.height')}</LansiaText>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
                placeholder={t('health.placeholders.height')}
              />
            </View>

            <View style={styles.inputGroup}>
              <LansiaText style={styles.label}>{t('health.age')}</LansiaText>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
                placeholder={t('health.placeholders.age')}
              />
            </View>

           {/* Gender Selection */}
<View style={styles.inputGroup}>
  <LansiaText style={styles.label}>{t('health.genderLabel')}</LansiaText>
  <View style={styles.genderContainer}>
    <Pressable
      style={[styles.genderButton, gender === 'male' && styles.genderButtonActive]}
      onPress={() => setGender('male')}
    >
      <LansiaText style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>
        {t('health.gender.male')}
      </LansiaText>
    </Pressable>
    <Pressable
      style={[styles.genderButton, gender === 'female' && styles.genderButtonActive]}
      onPress={() => setGender('female')}
    >
      <LansiaText style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>
        {t('health.gender.female')}
      </LansiaText>
    </Pressable>
  </View>
</View>


            {/* Activity Level */}
            <View style={styles.inputGroup}>
              <LansiaText style={styles.label}>{t('health.activityLevel')}</LansiaText>
              <View style={styles.activityContainer}>
                {['sedentary', 'light', 'moderate', 'active'].map((level) => (
                  <Pressable
                    key={level}
                    style={[styles.activityButton, activityLevel === level && styles.activityButtonActive]}
                    onPress={() => setActivityLevel(level as any)}
                  >
                    <LansiaText style={[styles.activityText, activityLevel === level && styles.activityTextActive]}>
                      {t(`health.activity.${level}`)}
                    </LansiaText>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable style={styles.button} onPress={calculateBMI}>
              <Feather name="check" size={20} color="#fff" />
              <LansiaText style={styles.buttonText}>{t('health.calculate')}</LansiaText>
            </Pressable>

            {bmiResult !== null && waterResult !== null && nutritionRec && (
              <View style={styles.resultContainer}>
                {/* BMI Section */}
                <View style={styles.bmiSection}>
                  <LansiaText style={styles.resultLabel}>{t('health.bmi')}:</LansiaText>
                  <LansiaText style={styles.resultValue}>{bmiResult}</LansiaText>
                  <View style={[styles.categoryBadge, { backgroundColor: getBMICategory(bmiResult).color }]}>
                    <LansiaText style={styles.categoryText}>{getBMICategory(bmiResult).category}</LansiaText>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Water Section */}
                <View style={styles.waterSection}>
                  <Feather name="droplet" size={24} color="#007AFF" />
                  <View>
                    <LansiaText style={styles.resultLabel}>{t('health.waterIntake')}:</LansiaText>
                    <LansiaText style={styles.resultValue}>{waterResult} ml / {t('health.day')}</LansiaText>
                    <LansiaText style={styles.subText}>≈ {Math.round(waterResult / 250)} {t('health.units.glasses')}</LansiaText>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Nutrition Recommendations */}
                <View style={styles.nutritionSection}>
                  <LansiaText style={styles.nutritionTitle}>{t('health.nutrition.title')}</LansiaText>
                  
                  {/* Macros */}
                  <View style={styles.macrosContainer}>
                    <View style={styles.macroItem}>
                      <LansiaText style={styles.macroValue}>{nutritionRec.calories}</LansiaText>
                      <LansiaText style={styles.macroLabel}>{t('health.nutrition.calories')}</LansiaText>
                    </View>
                    <View style={styles.macroItem}>
                      <LansiaText style={styles.macroValue}>{nutritionRec.protein}g</LansiaText>
                      <LansiaText style={styles.macroLabel}>{t('health.nutrition.protein')}</LansiaText>
                    </View>
                    <View style={styles.macroItem}>
                      <LansiaText style={styles.macroValue}>{nutritionRec.carbs}g</LansiaText>
                      <LansiaText style={styles.macroLabel}>{t('health.nutrition.carbs')}</LansiaText>
                    </View>
                    <View style={styles.macroItem}>
                      <LansiaText style={styles.macroValue}>{nutritionRec.fats}g</LansiaText>
                      <LansiaText style={styles.macroLabel}>{t('health.nutrition.fats')}</LansiaText>
                    </View>
                  </View>

                  {/* Tips */}
                  <View style={styles.tipsContainer}>
                  <LansiaText style={styles.tipsTitle}>{t('health.nutrition.tipsTitle')}</LansiaText>
                    {nutritionRec.tips.map((tip, index) => (
                      <View key={index} style={styles.tipItem}>
                        <LansiaText style={styles.tipBullet}>•</LansiaText>
                        <LansiaText style={styles.tipText}>{t(tip)}</LansiaText>
                      </View>
                    ))}
                  </View>

                  {/* Recommended Foods */}
                  <View style={styles.foodsContainer}>
                    <LansiaText style={styles.foodsTitle}>{t('health.nutrition.recommendedFoods')}</LansiaText>
                    <View style={styles.foodsList}>
                      {nutritionRec.foods.map((food, index) => (
                        <View key={index} style={styles.foodTag}>
                          <LansiaText style={styles.foodText}>{t(food)}</LansiaText>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Symptom Tracker Tab */}
        {activeTab === 'symptoms' && (
          <View>
            <View style={styles.headerRow}>
              <LansiaText style={styles.title}>{t('health.symptoms.title')}</LansiaText>
              <Pressable style={styles.addButton} onPress={() => setShowSymptomModal(true)}>
                <Feather name="plus" size={20} color="#fff" />
              </Pressable>
            </View>

            

            {symptoms.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="activity" size={48} color="#8E8E93" />
                <LansiaText style={styles.emptyText}>{t('health.symptoms.empty')}</LansiaText>
                <LansiaText style={styles.emptySubText}>{t('health.symptoms.emptySub')}</LansiaText>
              </View>
            ) : (
              <View style={styles.symptomsList}>
                {symptoms.map(symptom => (
                  <View key={symptom.id} style={styles.symptomCard}>
                    <View style={styles.symptomHeader}>
                      <LansiaText style={styles.symptomName}>{symptom.name}</LansiaText>
                      <Pressable onPress={() => removeSymptom(symptom.id)}>
                        <Feather name="x" size={20} color="#8E8E93" />
                      </Pressable>
                    </View>

                    <View style={styles.severityRow}>
                      <LansiaText style={styles.severityLabel}>{t('health.symptoms.severity')}:</LansiaText>
                      <View style={styles.severityDots}>
                        {[1, 2, 3, 4, 5].map(level => (
                          <View
                            key={level}
                            style={[
                              styles.severityDot,
                              {
                                backgroundColor: level <= symptom.severity 
                                  ? getSeverityColor(symptom.severity) 
                                  : '#E5E5EA'
                              }
                            ]}
                          />
                        ))}
                      </View>
                    </View>

                    {symptom.notes && (
                      <LansiaText style={styles.symptomNotes}>{symptom.notes}</LansiaText>
                    )}

                    <LansiaText style={styles.symptomDate}>{symptom.date}</LansiaText>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Vital Signs Tab */}
        {activeTab === 'vitals' && (
          <View>
            <LansiaText style={styles.title}>{t('health.vitals.title')}</LansiaText>

          {/* Blood Pressure */}
<View style={styles.vitalCard}>
  <View style={styles.vitalHeader}>
    <Feather name="heart" size={24} color="#FF3B30" />
    <LansiaText style={styles.vitalTitle}>
      {t('health.vitals.bloodPressure')}
    </LansiaText>
  </View>

  <View style={styles.bpInputRow}>
    {/* Systolic */}
    <View style={styles.bpInput}>
      <LansiaText style={styles.vitalLabel}>
        {t('health.vitals.systolic')}
      </LansiaText>
      <TextInput
        style={styles.vitalInputField}
        keyboardType="numeric"
        value={vitalSigns.bloodPressure.systolic}
        onChangeText={(value) =>
          setVitalSigns((prev) => ({
            ...prev,
            bloodPressure: { ...prev.bloodPressure, systolic: value },
          }))
        }
        placeholder="120"
      />

      {vitalSigns.bloodPressure.systolic ? (
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: getVitalStatus(
                "systolic",
                vitalSigns.bloodPressure.systolic
              ).color,
            },
          ]}
        >
          <LansiaText style={styles.statusText}>
            {
              getVitalStatus(
                "systolic",
                vitalSigns.bloodPressure.systolic
              ).status
            }
          </LansiaText>
        </View>
      ) : null}
    </View>

    <LansiaText style={styles.bpSeparator}>/</LansiaText>

    {/* Diastolic */}
    <View style={styles.bpInput}>
      <LansiaText style={styles.vitalLabel}>
        {t('health.vitals.diastolic')}
      </LansiaText>
      <TextInput
        style={styles.vitalInputField}
        keyboardType="numeric"
        value={vitalSigns.bloodPressure.diastolic}
        onChangeText={(value) =>
          setVitalSigns((prev) => ({
            ...prev,
            bloodPressure: { ...prev.bloodPressure, diastolic: value },
          }))
        }
        placeholder="80"
      />

      {vitalSigns.bloodPressure.diastolic ? (
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: getVitalStatus(
                "diastolic",
                vitalSigns.bloodPressure.diastolic
              ).color,
            },
          ]}
        >
          <LansiaText style={styles.statusText}>
            {
              getVitalStatus(
                "diastolic",
                vitalSigns.bloodPressure.diastolic
              ).status
            }
          </LansiaText>
        </View>
      ) : null}
    </View>
  </View>
</View>


            {/* Heart Rate */}
            <View style={styles.vitalCard}>
              <View style={styles.vitalHeader}>
                <Feather name="activity" size={24} color="#FF9500" />
                <LansiaText style={styles.vitalTitle}>{t('health.vitals.heartRate')}</LansiaText>
              </View>
              <TextInput
                style={styles.vitalInputField}
                keyboardType="numeric"
                value={vitalSigns.heartRate}
                onChangeText={(value) => 
                  setVitalSigns(prev => ({ ...prev, heartRate: value }))
                }
                placeholder={t('health.placeholders.heartRate')}
              />
              {vitalSigns.heartRate && (
                <View style={[styles.statusBadge, { backgroundColor: getVitalStatus('heartRate', vitalSigns.heartRate).color }]}>
                  <LansiaText style={styles.statusText}>
                    {getVitalStatus('heartRate', vitalSigns.heartRate).status}
                  </LansiaText>
                </View>
              )}
            </View>

            {/* Temperature */}
            <View style={styles.vitalCard}>
              <View style={styles.vitalHeader}>
                <Feather name="thermometer" size={24} color="#007AFF" />
                <LansiaText style={styles.vitalTitle}>{t('health.vitals.temperature')}</LansiaText>
              </View>
              <TextInput
                style={styles.vitalInputField}
                keyboardType="numeric"
                value={vitalSigns.temperature}
                onChangeText={(value) => 
                  setVitalSigns(prev => ({ ...prev, temperature: value }))
                }
                placeholder={t('health.placeholders.temperature')}
              />
              {vitalSigns.temperature && (
                <View style={[styles.statusBadge, { backgroundColor: getVitalStatus('temperature', vitalSigns.temperature).color }]}>
                  <LansiaText style={styles.statusText}>
                    {getVitalStatus('temperature', vitalSigns.temperature).status}
                  </LansiaText>
                </View>
              )}
            </View>

            {/* Blood Sugar */}
            <View style={styles.vitalCard}>
              <View style={styles.vitalHeader}>
                <Feather name="zap" size={24} color="#AF52DE" />
                <LansiaText style={styles.vitalTitle}>{t('health.vitals.bloodSugar')}</LansiaText>
              </View>
              <TextInput
                style={styles.vitalInputField}
                keyboardType="numeric"
                value={vitalSigns.bloodSugar}
                onChangeText={(value) => 
                  setVitalSigns(prev => ({ ...prev, bloodSugar: value }))
                }
                placeholder={t('health.placeholders.bloodSugar')}
              />
              {vitalSigns.bloodSugar && (
                <View style={[styles.statusBadge, { backgroundColor: getVitalStatus('bloodSugar', vitalSigns.bloodSugar).color }]}>
                  <LansiaText style={styles.statusText}>
                    {getVitalStatus('bloodSugar', vitalSigns.bloodSugar).status}
                  </LansiaText>
                </View>
              )}

<Pressable style={styles.button} onPress={validateVitalSigns}>
      <Feather name="check-circle" size={20} color="#fff" />
      <LansiaText style={styles.buttonText}>Validate Vital Signs</LansiaText>
    </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
{/* Symptom Modal */}
<Modal
  visible={showSymptomModal}
  animationType="slide"
  presentationStyle="pageSheet"
>
  <View style={styles.modalContainer}>
    <View style={styles.modalHeader}>
      <Pressable onPress={() => setShowSymptomModal(false)}>
        <LansiaText style={styles.modalCancel}>{t('cancel')}</LansiaText>
      </Pressable>
      <LansiaText style={styles.modalTitle}>{t('health.symptoms.addNew')}</LansiaText>
      <Pressable onPress={addSymptom}>
        <LansiaText style={styles.modalSave}>{t('save')}</LansiaText>
      </Pressable>
    </View>
    
    <ScrollView style={styles.modalContent}>
      <View style={styles.inputGroup}>
        <LansiaText style={styles.label}>{t('health.symptoms.name')}</LansiaText>
        <TextInput
          style={styles.input}
          value={newSymptom.name}
          onChangeText={(value) => setNewSymptom(prev => ({ ...prev, name: value }))}
          placeholder={t('health.symptoms.namePlaceholder')}
        />
      </View>

      <View style={styles.inputGroup}>
        <LansiaText style={styles.label}>{t('health.symptoms.severity')} ({newSymptom.severity}/5)</LansiaText>
        <View style={styles.severitySelector}>
          {[1, 2, 3, 4, 5].map(level => (
            <Pressable
              key={level}
              style={[
                styles.severityButton,
                newSymptom.severity === level && styles.severityButtonActive
              ]}
              onPress={() => setNewSymptom(prev => ({ ...prev, severity: level }))}
            >
              <LansiaText style={[
                styles.severityButtonText,
                newSymptom.severity === level && styles.severityButtonTextActive
              ]}>
                {level}
              </LansiaText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <LansiaText style={styles.label}>{t('health.symptoms.notes')} ({t('optional')})</LansiaText>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={newSymptom.notes}
          onChangeText={(value) => setNewSymptom(prev => ({ ...prev, notes: value }))}
          placeholder={t('health.symptoms.notesPlaceholder')}
          multiline
          numberOfLines={4}
        />
      </View>
    </ScrollView>
  </View>
</Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  
  // Tab Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  activeTab: { backgroundColor: '#F0F8FF' },
  tabLabel: { fontSize: 14, color: '#8E8E93', fontWeight: '500' },
  activeTabLabel: { color: '#007AFF' },

  // General Styles
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 32 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 16, marginBottom: 8, fontWeight: '500' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  // Gender Selection
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  genderText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  genderTextActive: {
    color: '#fff',
  },

  // Activity Level
  activityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activityButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  activityText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  activityTextActive: {
    color: '#fff',
  },
    // Button
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#007AFF',
      paddingVertical: 14,
      borderRadius: 12,
      marginTop: 20,
      gap: 8,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  
    // Result Container
    resultContainer: {
      marginTop: 24,
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    bmiSection: {
      alignItems: 'center',
    },
    resultLabel: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
    resultValue: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
    categoryBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      marginTop: 8,
    },
    categoryText: { color: '#fff', fontWeight: '600' },
  
    divider: {
      height: 1,
      backgroundColor: '#E5E5EA',
      marginVertical: 16,
    },
  
    // Water Section
    waterSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    subText: { fontSize: 14, color: '#8E8E93' },
  
    // Nutrition
    nutritionSection: { marginTop: 16 },
    nutritionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
    macrosContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    macroItem: { alignItems: 'center' },
    macroValue: { fontSize: 18, fontWeight: '600' },
    macroLabel: { fontSize: 14, color: '#8E8E93' },
    tipsContainer: { marginBottom: 16 },
    tipsTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
    tipItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
    tipBullet: { fontSize: 16, marginRight: 6 },
    tipText: { flex: 1, fontSize: 14 },
    foodsContainer: { marginTop: 12 },
    foodsTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
    foodsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    foodTag: {
      backgroundColor: '#F0F8FF',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    foodText: { fontSize: 14, color: '#007AFF' },
  // Symptoms
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 6,
    textAlign: 'center',
  },
  symptomsList: {
    gap: 12,
  },
  symptomCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  symptomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  symptomName: {
    fontSize: 16,
    fontWeight: '600',
  },
  severityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  severityDots: {
    flexDirection: 'row',
    gap: 4,
  },
  severityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  symptomNotes: {
    fontSize: 14,
    marginBottom: 6,
    color: '#555',
  },
  symptomDate: {
    fontSize: 12,
    color: '#8E8E93',
  },

  // Vitals
  vitalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  vitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  vitalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  bpInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bpInput: {
    flex: 1,
  },
  bpSeparator: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8E8E93',
  },
  vitalLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  vitalInputField: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    fontSize: 16,
  },
  statusBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalCancel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  modalSave: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  severitySelector: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  severityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityButtonActive: {
    backgroundColor: '#007AFF',
  },
  severityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  severityButtonTextActive: {
    color: '#fff',
  },
}); 