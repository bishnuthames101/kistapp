export interface LabTest {
  id: string;
  name: string;
  description: string;
  price: number;
  turnaroundTime: string;
  requirements: string;
}

export interface TestPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  tests: string[];
  turnaroundTime: string;
  requirements: string;
  image: string;
  category: string;
  features?: string[];
}

export const labTests: LabTest[] = [
  {
    id: 'cbc',
    name: 'Complete Blood Count (CBC)',
    description: 'Measures different components of blood including RBC, WBC, and platelets',
    price: 500,
    turnaroundTime: 'Same Day',
    requirements: 'Fasting not required'
  },
  {
    id: 'blood-sugar-fasting',
    name: 'Blood Sugar (Fasting)',
    description: 'Measures blood glucose levels after 8-12 hours of fasting',
    price: 200,
    turnaroundTime: 'Same Day',
    requirements: '8-12 hours fasting required'
  },
  {
    id: 'lipid-profile',
    name: 'Lipid Profile',
    description: 'Measures cholesterol and triglycerides levels',
    price: 800,
    turnaroundTime: 'Same Day',
    requirements: '12 hours fasting required'
  },
  {
    id: 'thyroid-profile',
    name: 'Thyroid Profile (T3, T4, TSH)',
    description: 'Evaluates thyroid function',
    price: 1200,
    turnaroundTime: '24 Hours',
    requirements: 'No special preparation needed'
  },
  {
    id: 'liver-function',
    name: 'Liver Function Test (LFT)',
    description: 'Evaluates liver function and health',
    price: 1000,
    turnaroundTime: 'Same Day',
    requirements: '8-12 hours fasting required'
  },
  {
    id: 'kidney-function',
    name: 'Kidney Function Test (RFT)',
    description: 'Evaluates kidney function and health',
    price: 1000,
    turnaroundTime: 'Same Day',
    requirements: '8-12 hours fasting required'
  },
  {
    id: 'hba1c',
    name: 'HbA1c',
    description: 'Measures average blood sugar levels over past 3 months',
    price: 800,
    turnaroundTime: 'Same Day',
    requirements: 'No fasting required'
  },
  {
    id: 'urine-routine',
    name: 'Urine Routine',
    description: 'Analyzes physical, chemical, and microscopic aspects of urine',
    price: 300,
    turnaroundTime: 'Same Day',
    requirements: 'Early morning sample preferred'
  }
];

export const testPackages: TestPackage[] = [
  {
    id: 'basic-full-body-checkup',
    name: 'Basic Full Body Checkup',
    description: 'Comprehensive basic health screening package covering all essential body systems and functions',
    price: 3950,
    tests: ['CBC', 'Blood Sugar (F)', 'Lipid Profile', 'Urine Routine', 'Liver Function', 'Kidney Function'],
    turnaroundTime: 'Same Day',
    requirements: '12 hours fasting required',
    image: '/tests/basic_full_body_checkup.jpg',
    category: 'Full Body Checkup',
    features: ['Complete Blood Count', 'Metabolic Panel', 'Organ Function Tests', 'General Health Assessment']
  },
  {
    id: 'premium-full-body-checkup',
    name: 'Premium Full Body Checkup',
    description: 'Advanced comprehensive health screening with extensive tests for complete health assessment',
    price: 7350,
    tests: ['CBC', 'Lipid Profile', 'Liver Function', 'Kidney Function', 'Thyroid Profile', 'Vitamin Profile', 'HbA1c', 'ECG', 'Chest X-Ray'],
    turnaroundTime: '48 Hours',
    requirements: '12 hours fasting required',
    image: '/tests/premium_full_body_checkup.jpg',
    category: 'Full Body Checkup',
    features: ['Complete Blood Analysis', 'Organ Function Tests', 'Cardiac Assessment', 'Vitamin Deficiency Check', 'Imaging Studies']
  },
  {
    id: 'diabetes-profile-test',
    name: 'Diabetes Profile Test',
    description: 'Essential diabetes screening package for blood sugar monitoring and glycemic control',
    price: 1500,
    tests: ['Blood Sugar (F)', 'Blood Sugar (PP)', 'HbA1c', 'Urine Sugar'],
    turnaroundTime: '24 Hours',
    requirements: '12 hours fasting required',
    image: '/tests/diabetes_profile_test.jpg',
    category: 'Diabetes & Metabolic',
    features: ['Fasting Blood Sugar', 'Post-Prandial Sugar', '3-Month Glucose Average', 'Urine Analysis']
  },
  {
    id: 'advance-diabetes-profile',
    name: 'Advance Diabetes Profile',
    description: 'Comprehensive diabetes assessment with complications screening and organ function tests',
    price: 3800,
    tests: ['Blood Sugar (F)', 'Blood Sugar (PP)', 'HbA1c', 'Kidney Function', 'Lipid Profile', 'Microalbuminuria', 'Electrolytes'],
    turnaroundTime: '24 Hours',
    requirements: '12 hours fasting required',
    image: '/tests/advance_diabetes_profile.jpg',
    category: 'Diabetes & Metabolic',
    features: ['Complete Diabetes Panel', 'Kidney Damage Screening', 'Cardiovascular Risk Assessment', 'Electrolyte Balance']
  },
  {
    id: 'heart-health-package',
    name: 'Heart Health Package',
    description: 'Comprehensive cardiac risk assessment and heart health monitoring',
    price: 7999,
    tests: ['Lipid Profile', 'ECG', 'CRP', 'Homocysteine', 'Troponin T', 'Blood Pressure Monitoring'],
    turnaroundTime: '24 Hours',
    requirements: '12 hours fasting required',
    image: '/tests/heart_health_package.jpg',
    category: 'Cardiac Health',
    features: ['Cholesterol Assessment', 'Cardiac Biomarkers', 'ECG Analysis', 'Inflammation Markers', 'Heart Attack Risk']
  },
  {
    id: 'female-hormone-test',
    name: 'Female Hormone Test',
    description: 'Comprehensive female hormonal panel for reproductive health and hormone balance',
    price: 6500,
    tests: ['FSH', 'LH', 'Estradiol', 'Progesterone', 'Prolactin', 'Testosterone', 'DHEAS'],
    turnaroundTime: '48 Hours',
    requirements: 'Specific cycle day testing may be required',
    image: '/tests/female_hormone_test.jpg',
    category: 'Hormone & Wellness',
    features: ['Reproductive Hormones', 'Ovulation Assessment', 'Menstrual Irregularities', 'Fertility Evaluation']
  },
  {
    id: 'male-hormone-test',
    name: 'Male Hormone Test',
    description: 'Complete male hormonal assessment for reproductive health and vitality',
    price: 6500,
    tests: ['Testosterone (Total)', 'Testosterone (Free)', 'FSH', 'LH', 'Prolactin', 'SHBG'],
    turnaroundTime: '48 Hours',
    requirements: 'Morning sample preferred',
    image: '/tests/male_hormone_test.jpg',
    category: 'Hormone & Wellness',
    features: ['Testosterone Levels', 'Fertility Markers', 'Libido Assessment', 'Energy & Vitality Check']
  },
  {
    id: 'female-premarriage-test-package',
    name: 'Female Premarriage Test Package',
    description: 'Comprehensive health screening for women before marriage including fertility and genetic tests',
    price: 5800,
    tests: ['CBC', 'Blood Group & Rh', 'HIV', 'Hepatitis B & C', 'VDRL', 'Rubella IgG', 'Thyroid Profile', 'Hormone Panel', 'Pap Smear'],
    turnaroundTime: '48 Hours',
    requirements: '12 hours fasting required',
    image: '/tests/female_premarriage_test_package.jpg',
    category: 'Premarital Screening',
    features: ['Infectious Disease Screening', 'Fertility Assessment', 'Genetic Screening', 'Reproductive Health', 'Immunity Check']
  },
  {
    id: 'male-premarriage-test-package',
    name: 'Male Premarriage Test Package',
    description: 'Complete health screening for men before marriage including fertility and genetic tests',
    price: 5500,
    tests: ['CBC', 'Blood Group & Rh', 'HIV', 'Hepatitis B & C', 'VDRL', 'Thalassemia Screening', 'Semen Analysis', 'Hormone Panel'],
    turnaroundTime: '48 Hours',
    requirements: '12 hours fasting required',
    image: '/tests/male_premarriage_test_package.jpg',
    category: 'Premarital Screening',
    features: ['Infectious Disease Screening', 'Fertility Assessment', 'Genetic Screening', 'Reproductive Health', 'Complete Blood Work']
  },
  {
    id: 'pcos-pcod',
    name: 'PCOS/PCOD Profile',
    description: 'Specialized testing for Polycystic Ovary Syndrome diagnosis and management',
    price: 4999,
    tests: ['FSH', 'LH', 'Testosterone', 'DHEAS', 'Fasting Insulin', 'Blood Sugar', 'Thyroid Profile', 'Prolactin', 'Lipid Profile'],
    turnaroundTime: '48 Hours',
    requirements: '12 hours fasting required',
    image: '/tests/pcos_pcod.jpg',
    category: 'Hormone & Wellness',
    features: ['Hormonal Imbalance Check', 'Insulin Resistance', 'Metabolic Assessment', 'Reproductive Hormones']
  },
  {
    id: 'fertility-panel-test',
    name: 'Fertility Panel Test',
    description: 'Comprehensive fertility assessment for couples planning pregnancy (Male: Rs 3999, Female: Rs 7999)',
    price: 7999,
    tests: ['FSH', 'LH', 'Estradiol', 'Progesterone', 'Prolactin', 'AMH', 'TSH', 'Vitamin D'],
    turnaroundTime: '48 Hours',
    requirements: 'Specific cycle day testing may be required',
    image: '/tests/fertility_panel_test.jpg',
    category: 'Fertility & Reproductive',
    features: ['Ovarian Reserve', 'Hormone Balance', 'Thyroid Function', 'Nutritional Status']
  },
  {
    id: 'sti-detection',
    name: 'STI Detection Package',
    description: 'Basic sexually transmitted infection screening panel',
    price: 1600,
    tests: ['HIV', 'Hepatitis B', 'Hepatitis C', 'VDRL', 'Chlamydia', 'Gonorrhea'],
    turnaroundTime: '48 Hours',
    requirements: 'No special preparation needed',
    image: '/tests/STI_detection.jpg',
    category: 'Infectious Disease',
    features: ['HIV Screening', 'Hepatitis Detection', 'Bacterial Infections', 'Confidential Testing']
  },
  {
    id: 'advance-sti-detection',
    name: 'Advance STI Detection',
    description: 'Comprehensive sexually transmitted infection screening with extended panel',
    price: 4500,
    tests: ['HIV 1 & 2', 'Hepatitis B Surface Antigen', 'Hepatitis C', 'VDRL', 'HSV 1 & 2', 'Chlamydia', 'Gonorrhea', 'Trichomonas'],
    turnaroundTime: '72 Hours',
    requirements: 'No special preparation needed',
    image: '/tests/advance_STI_detection.jpg',
    category: 'Infectious Disease',
    features: ['Extended STI Panel', 'Viral & Bacterial Tests', 'Herpes Screening', 'Complete Privacy']
  },
  {
    id: 'cancer-screening-test',
    name: 'Cancer Screening Test',
    description: 'Multi-organ cancer marker screening for early detection (Male: Rs 4500, Female: Rs 6500)',
    price: 6500,
    tests: ['CEA', 'CA 19-9', 'CA 125', 'PSA (Males)', 'AFP', 'CBC', 'Liver Function', 'Kidney Function'],
    turnaroundTime: '48 Hours',
    requirements: '12 hours fasting required',
    image: '/tests/cancer_screening_test.jpg',
    category: 'Cancer Screening',
    features: ['Tumor Markers', 'Multi-Organ Screening', 'Early Detection', 'Preventive Health']
  },
  {
    id: 'iron-profile-test',
    name: 'Iron Profile Test',
    description: 'Complete iron deficiency and anemia assessment',
    price: 1700,
    tests: ['Serum Iron', 'TIBC', 'Ferritin', 'Transferrin Saturation', 'Hemoglobin', 'CBC'],
    turnaroundTime: '24 Hours',
    requirements: 'Morning sample preferred',
    image: '/tests/iron_profile_test.jpg',
    category: 'Nutritional Health',
    features: ['Iron Levels', 'Storage Iron', 'Anemia Detection', 'Iron Absorption']
  },
  {
    id: 'arthritis-panel-test',
    name: 'Arthritis Panel Test',
    description: 'Comprehensive screening for arthritis and joint inflammation',
    price: 5999,
    tests: ['Rheumatoid Factor', 'Anti-CCP', 'ESR', 'CRP', 'Uric Acid', 'ANA', 'CBC'],
    turnaroundTime: '48 Hours',
    requirements: 'No special preparation needed',
    image: '/tests/arthritis_panel_test.jpg',
    category: 'Autoimmune & Joint',
    features: ['Rheumatoid Arthritis', 'Inflammation Markers', 'Autoimmune Detection', 'Gout Assessment']
  },
  {
    id: 'food-allergy-panel-test',
    name: 'Food Allergy Panel Test',
    description: 'Comprehensive food allergen testing for common food sensitivities',
    price: 3999,
    tests: ['IgE Antibodies - Milk', 'Eggs', 'Peanuts', 'Tree Nuts', 'Soy', 'Wheat', 'Fish', 'Shellfish', 'Total IgE'],
    turnaroundTime: '72 Hours',
    requirements: 'No special preparation needed',
    image: '/tests/food_allergy_panel_test.jpg',
    category: 'Allergy Testing',
    features: ['Common Food Allergens', 'IgE Antibody Testing', 'Dietary Guidance', 'Allergy Severity']
  },
  {
    id: 'inhalation-allergy-panel-test',
    name: 'Inhalation Allergy Panel Test',
    description: 'Environmental and respiratory allergen screening',
    price: 3999,
    tests: ['Dust Mites', 'Pollen', 'Mold', 'Pet Dander', 'Cockroach', 'Total IgE', 'Eosinophil Count'],
    turnaroundTime: '72 Hours',
    requirements: 'No special preparation needed',
    image: '/tests/inhalation_allergy_panel_test.jpg',
    category: 'Allergy Testing',
    features: ['Environmental Allergens', 'Respiratory Triggers', 'Seasonal Allergies', 'Pet Allergies']
  },
  {
    id: 'hairfall-screening-test',
    name: 'Hairfall Screening Test',
    description: 'Comprehensive assessment for hair loss and scalp health (Male: Rs 6999, Female: Rs 7499)',
    price: 7499,
    tests: ['Vitamin D', 'Vitamin B12', 'Ferritin', 'Thyroid Profile', 'Testosterone', 'DHEAS', 'Zinc', 'Complete Blood Count'],
    turnaroundTime: '48 Hours',
    requirements: '12 hours fasting required',
    image: '/tests/hairfall_screening_test.jpg',
    category: 'Wellness & Beauty',
    features: ['Nutritional Deficiency', 'Hormonal Imbalance', 'Thyroid Function', 'Vitamin Levels']
  },
  {
    id: 'smokers-wellness-panel-test',
    name: 'Smokers Wellness Panel Test',
    description: 'Specialized health screening for smokers to assess smoking-related health risks',
    price: 6500,
    tests: ['Chest X-Ray', 'Pulmonary Function Test', 'CBC', 'Lipid Profile', 'Liver Function', 'Kidney Function', 'ECG', 'CRP', 'Vitamin D'],
    turnaroundTime: '48 Hours',
    requirements: '12 hours fasting required',
    image: '/tests/smokers_wellness_panel_test.jpg',
    category: 'Lifestyle Health',
    features: ['Lung Function', 'Cardiac Assessment', 'Organ Damage Screening', 'Inflammation Markers', 'Comprehensive Health']
  }
];
