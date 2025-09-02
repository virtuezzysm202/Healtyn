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

export default function HealthCalculatorScreen() {
  const { t } = useTranslation();

  // BMI Calculator States
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [bmiResult, setBmiResult] = useState<number | null>(null);
  const [waterResult, setWaterResult] = useState<number | null>(null);

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
    if (!w || !h) {
      Alert.alert(t('error'), t('health.invalidInput'));
      return;
    }
    const bmi = w / (h * h);
    setBmiResult(parseFloat(bmi.toFixed(1)));

    // Water intake: simple formula 35 ml per kg bodyweight
    const water = w * 35; // ml
    setWaterResult(Math.round(water));
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: '#FF9500' };
    if (bmi < 25) return { category: 'Normal', color: '#34C759' };
    if (bmi < 30) return { category: 'Overweight', color: '#FF9500' };
    return { category: 'Obese', color: '#FF3B30' };
  };

  const addSymptom = () => {
    if (!newSymptom.name.trim()) {
      Alert.alert('Error', 'Please enter symptom name');
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
    if (!val) return { status: 'Unknown', color: '#8E8E93' };

    switch (type) {
      case 'heartRate':
        if (val < 60) return { status: 'Low', color: '#FF9500' };
        if (val > 100) return { status: 'High', color: '#FF3B30' };
        return { status: 'Normal', color: '#34C759' };
      
      case 'temperature':
        if (val < 36.1) return { status: 'Low', color: '#007AFF' };
        if (val > 37.2) return { status: 'High', color: '#FF3B30' };
        return { status: 'Normal', color: '#34C759' };
      
      case 'bloodSugar':
        if (val < 70) return { status: 'Low', color: '#FF3B30' };
        if (val > 140) return { status: 'High', color: '#FF3B30' };
        return { status: 'Normal', color: '#34C759' };
      
      default:
        return { status: 'Unknown', color: '#8E8E93' };
    }
  };

  const renderTabButton = (tab: typeof activeTab, icon: string, label: string) => (
    <Pressable
      style={[styles.tabButton, activeTab === tab && styles.activeTab]}
      onPress={() => setActiveTab(tab)}
    >
      <Feather name={icon as any} size={20} color={activeTab === tab ? '#007AFF' : '#8E8E93'} />
      <LansiaText style={[styles.tabLabel, activeTab === tab && styles.activeTabLabel]}>
        {label}
      </LansiaText>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton('calculator', 'calculator', 'Calculator')}
        {renderTabButton('symptoms', 'activity', 'Symptoms')}
        {renderTabButton('vitals', 'heart', 'Vitals')}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* BMI Calculator Tab */}
        {activeTab === 'calculator' && (
          <View>
            <LansiaText style={styles.title}>{t('health.title')}</LansiaText>

            <View style={styles.inputGroup}>
              <LansiaText style={styles.label}>{t('health.weight')} (kg)</LansiaText>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
                placeholder="70"
              />
            </View>

            <View style={styles.inputGroup}>
              <LansiaText style={styles.label}>{t('health.height')} (cm)</LansiaText>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
                placeholder="170"
              />
            </View>

            <View style={styles.inputGroup}>
              <LansiaText style={styles.label}>Age (years)</LansiaText>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
                placeholder="65"
              />
            </View>

            <Pressable style={styles.button} onPress={calculateBMI}>
              <Feather name="check" size={20} color="#fff" />
              <LansiaText style={styles.buttonText}>{t('health.calculate')}</LansiaText>
            </Pressable>

            {bmiResult !== null && waterResult !== null && (
              <View style={styles.resultContainer}>
                <View style={styles.bmiSection}>
                  <LansiaText style={styles.resultLabel}>{t('health.bmi')}:</LansiaText>
                  <LansiaText style={styles.resultValue}>{bmiResult}</LansiaText>
                  <View style={[styles.categoryBadge, { backgroundColor: getBMICategory(bmiResult).color }]}>
                    <LansiaText style={styles.categoryText}>{getBMICategory(bmiResult).category}</LansiaText>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.waterSection}>
                  <Feather name="droplet" size={24} color="#007AFF" />
                  <View>
                    <LansiaText style={styles.resultLabel}>{t('health.waterIntake')}:</LansiaText>
                    <LansiaText style={styles.resultValue}>{waterResult} ml / day</LansiaText>
                    <LansiaText style={styles.subText}>≈ {Math.round(waterResult / 250)} glasses</LansiaText>
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
              <LansiaText style={styles.title}>Symptom Tracker</LansiaText>
              <Pressable style={styles.addButton} onPress={() => setShowSymptomModal(true)}>
                <Feather name="plus" size={20} color="#fff" />
              </Pressable>
            </View>

            {symptoms.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="activity" size={48} color="#8E8E93" />
                <LansiaText style={styles.emptyText}>No symptoms tracked yet</LansiaText>
                <LansiaText style={styles.emptySubText}>
                  Track your daily symptoms to monitor your health
                </LansiaText>
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
                      <LansiaText style={styles.severityLabel}>Severity:</LansiaText>
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
            <LansiaText style={styles.title}>Vital Signs Monitor</LansiaText>

            <View style={styles.vitalCard}>
              <View style={styles.vitalHeader}>
                <Feather name="heart" size={24} color="#FF3B30" />
                <LansiaText style={styles.vitalTitle}>Blood Pressure</LansiaText>
              </View>
              <View style={styles.bpInputRow}>
                <View style={styles.bpInput}>
                  <LansiaText style={styles.vitalLabel}>Systolic</LansiaText>
                  <TextInput
                    style={styles.vitalInputField}
                    keyboardType="numeric"
                    value={vitalSigns.bloodPressure.systolic}
                    onChangeText={(value) => 
                      setVitalSigns(prev => ({
                        ...prev,
                        bloodPressure: { ...prev.bloodPressure, systolic: value }
                      }))
                    }
                    placeholder="120"
                  />
                </View>
                <LansiaText style={styles.bpSeparator}>/</LansiaText>
                <View style={styles.bpInput}>
                  <LansiaText style={styles.vitalLabel}>Diastolic</LansiaText>
                  <TextInput
                    style={styles.vitalInputField}
                    keyboardType="numeric"
                    value={vitalSigns.bloodPressure.diastolic}
                    onChangeText={(value) => 
                      setVitalSigns(prev => ({
                        ...prev,
                        bloodPressure: { ...prev.bloodPressure, diastolic: value }
                      }))
                    }
                    placeholder="80"
                  />
                </View>
              </View>
            </View>

            <View style={styles.vitalCard}>
              <View style={styles.vitalHeader}>
                <Feather name="activity" size={24} color="#FF9500" />
                <LansiaText style={styles.vitalTitle}>Heart Rate</LansiaText>
              </View>
              <TextInput
                style={styles.vitalInputField}
                keyboardType="numeric"
                value={vitalSigns.heartRate}
                onChangeText={(value) => 
                  setVitalSigns(prev => ({ ...prev, heartRate: value }))
                }
                placeholder="72 BPM"
              />
              {vitalSigns.heartRate && (
                <View style={[styles.statusBadge, { backgroundColor: getVitalStatus('heartRate', vitalSigns.heartRate).color }]}>
                  <LansiaText style={styles.statusText}>
                    {getVitalStatus('heartRate', vitalSigns.heartRate).status}
                  </LansiaText>
                </View>
              )}
            </View>

            <View style={styles.vitalCard}>
              <View style={styles.vitalHeader}>
                <Feather name="thermometer" size={24} color="#007AFF" />
                <LansiaText style={styles.vitalTitle}>Temperature</LansiaText>
              </View>
              <TextInput
                style={styles.vitalInputField}
                keyboardType="numeric"
                value={vitalSigns.temperature}
                onChangeText={(value) => 
                  setVitalSigns(prev => ({ ...prev, temperature: value }))
                }
                placeholder="36.5°C"
              />
              {vitalSigns.temperature && (
                <View style={[styles.statusBadge, { backgroundColor: getVitalStatus('temperature', vitalSigns.temperature).color }]}>
                  <LansiaText style={styles.statusText}>
                    {getVitalStatus('temperature', vitalSigns.temperature).status}
                  </LansiaText>
                </View>
              )}
            </View>

            <View style={styles.vitalCard}>
              <View style={styles.vitalHeader}>
                <Feather name="zap" size={24} color="#AF52DE" />
                <LansiaText style={styles.vitalTitle}>Blood Sugar</LansiaText>
              </View>
              <TextInput
                style={styles.vitalInputField}
                keyboardType="numeric"
                value={vitalSigns.bloodSugar}
                onChangeText={(value) => 
                  setVitalSigns(prev => ({ ...prev, bloodSugar: value }))
                }
                placeholder="100 mg/dL"
              />
              {vitalSigns.bloodSugar && (
                <View style={[styles.statusBadge, { backgroundColor: getVitalStatus('bloodSugar', vitalSigns.bloodSugar).color }]}>
                  <LansiaText style={styles.statusText}>
                    {getVitalStatus('bloodSugar', vitalSigns.bloodSugar).status}
                  </LansiaText>
                </View>
              )}
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
              <Feather name="x" size={24} color="#8E8E93" />
            </Pressable>
            <LansiaText style={styles.modalTitle}>Add Symptom</LansiaText>
            <Pressable onPress={addSymptom}>
              <LansiaText style={styles.saveButton}>Save</LansiaText>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <LansiaText style={styles.label}>Symptom Name</LansiaText>
              <TextInput
                style={styles.input}
                value={newSymptom.name}
                onChangeText={(value) => setNewSymptom(prev => ({ ...prev, name: value }))}
                placeholder="e.g., Headache, Fatigue, Joint pain"
              />
            </View>

            <View style={styles.inputGroup}>
              <LansiaText style={styles.label}>Severity (1-5)</LansiaText>
              <View style={styles.severitySelector}>
                {[1, 2, 3, 4, 5].map(level => (
                  <Pressable
                    key={level}
                    style={[
                      styles.severityButton,
                      newSymptom.severity === level && styles.selectedSeverity
                    ]}
                    onPress={() => setNewSymptom(prev => ({ ...prev, severity: level }))}
                  >
                    <LansiaText style={[
                      styles.severityButtonText,
                      newSymptom.severity === level && styles.selectedSeverityText
                    ]}>
                      {level}
                    </LansiaText>
                  </Pressable>
                ))}
              </View>
              <View style={styles.severityLabels}>
                <LansiaText style={styles.severityLabelText}>Mild</LansiaText>
                <LansiaText style={styles.severityLabelText}>Severe</LansiaText>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <LansiaText style={styles.label}>Notes (Optional)</LansiaText>
              <TextInput
                style={[styles.input, styles.notesInput]}
                multiline
                numberOfLines={3}
                value={newSymptom.notes}
                onChangeText={(value) => setNewSymptom(prev => ({ ...prev, notes: value }))}
                placeholder="Additional details about the symptom..."
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
  scrollContainer: { flexGrow: 1, padding: 20 },
  
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
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 16,
    marginVertical: 20,
    gap: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // BMI Results
  resultContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginTop: 10 },
  bmiSection: { alignItems: 'center' },
  waterSection: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  resultLabel: { fontSize: 16, fontWeight: '600', marginTop: 8 },
  resultValue: { fontSize: 24, fontWeight: '700', marginTop: 4, color: '#007AFF' },
  subText: { fontSize: 14, color: '#8E8E93', marginTop: 2 },
  categoryBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 8 },
  categoryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#E5E5EA', marginVertical: 16 },

  // Symptom Tracker
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#34C759',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#8E8E93', marginTop: 16 },
  emptySubText: { fontSize: 14, color: '#8E8E93', textAlign: 'center', marginTop: 8 },
  symptomsList: { gap: 12 },
  symptomCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  symptomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  symptomName: { fontSize: 18, fontWeight: '600' },
  severityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  severityLabel: { fontSize: 14, color: '#8E8E93' },
  severityDots: { flexDirection: 'row', gap: 4 },
  severityDot: { width: 12, height: 12, borderRadius: 6 },
  symptomNotes: { fontSize: 14, color: '#8E8E93', fontStyle: 'italic', marginBottom: 8 },
  symptomDate: { fontSize: 12, color: '#8E8E93' },

  // Vital Signs
  vitalCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  vitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  vitalTitle: { fontSize: 18, fontWeight: '600' },
  vitalLabel: { fontSize: 14, color: '#8E8E93', marginBottom: 4 },
  vitalInputField: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  bpInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  bpInput: { flex: 1 },
  bpSeparator: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, color: '#8E8E93' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: '#F2F2F7' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  saveButton: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  modalContent: { flex: 1, padding: 20 },
  severitySelector: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
  },
  severityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  selectedSeverity: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  severityButtonText: { fontSize: 16, fontWeight: '600', color: '#8E8E93' },
  selectedSeverityText: { color: '#fff' },
  severityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  severityLabelText: { fontSize: 12, color: '#8E8E93' },
  notesInput: { height: 80, textAlignVertical: 'top' },
});