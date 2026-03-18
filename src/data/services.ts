import { Heart, Home, Syringe, Stethoscope, Activity, RadioTower, Bone, Scissors, Baby, Brain, HeartPulse, Droplet } from 'lucide-react';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  icon: any;
  price: number;
  doctors: Doctor[];
  features: string[];
  faqs: Array<{ question: string; answer: string; }>;
}

export const services: Service[] = [
  {
    id: 'opd-consultation',
    name: 'OPD Consultation',
    description: 'General doctor consultation with experienced physicians',
    longDescription: 'Get comprehensive general medical consultations from our experienced physicians. We provide thorough examinations, diagnoses, and treatment plans for various health conditions.',
    icon: Stethoscope,
    price: 650,
    doctors: [
      {
        id: '2',
        name: 'Dr. Arbind Sah',
        specialty: 'Senior Consultant Physician, MD (Internal Medicine)',
        image: '/doctors/Arbind Sah.jpg'
      }
    ],
    features: [
      'Daily consultations (8AM-8PM)',
      'Comprehensive health assessments',
      'Treatment plans and prescriptions',
      '7+ years of experience'
    ],
    faqs: [
      {
        question: 'What conditions can be treated during OPD?',
        answer: 'Our OPD handles a wide range of medical conditions including fever, infections, chronic diseases, and general health concerns.'
      },
      {
        question: 'Do I need an appointment?',
        answer: 'Walk-ins are welcome during our operating hours (8AM-8PM daily), though appointments are recommended to avoid waiting.'
      }
    ]
  },
  {
    id: 'general-surgeries',
    name: 'General, Laparoscopic & Laser Surgery',
    description: 'Expert surgical consultation - treatment cost determined based on condition',
    longDescription: 'Our surgical department offers comprehensive general, laparoscopic, and laser surgical procedures performed by highly experienced consultant surgeons using modern techniques. Consultation required to determine treatment plan and costs based on individual patient needs.',
    icon: Scissors,
    price: 800,
    doctors: [
      {
        id: '1',
        name: 'Dr. Prabhakar Shah',
        specialty: 'Consultant General, Laparoscopic & Laser Surgeon',
        image: '/doctors/Prabhakar Shah.jpg'
      }
    ],
    features: [
      'Minimally invasive laparoscopic surgery',
      'Advanced laser surgical techniques',
      'General surgical procedures',
      '10+ years of experience'
    ],
    faqs: [
      {
        question: 'What types of surgeries do you perform?',
        answer: 'We perform a wide range of general surgeries, including laparoscopic procedures and laser surgeries for various conditions.'
      },
      {
        question: 'What is the cost of surgery?',
        answer: 'Surgery costs vary based on the type of procedure and individual patient needs. Consultation fee is NPR 800. Treatment costs will be discussed during the consultation.'
      }
    ]
  },
  {
    id: 'piles-treatment',
    name: 'Hemorrhoids, Fissure & Fistula Treatment',
    description: 'Best hemorrhoids treatment in Kathmandu with high success rate',
    longDescription: 'Specialized treatment for hemorrhoids (piles), anal fissures, and fistulas. We offer the best hemorrhoids treatment in Kathmandu, Nepal with a proven high success rate using modern surgical techniques. Treatment cost will be discussed during the OPD consultation.',
    icon: Heart,
    price: 800,
    doctors: [
      {
        id: '1',
        name: 'Dr. Prabhakar Shah',
        specialty: 'Consultant General, Laparoscopic & Laser Surgeon',
        image: '/doctors/Prabhakar Shah.jpg'
      }
    ],
    features: [
      'High success rate treatment',
      'Modern surgical techniques',
      'Minimally invasive procedures',
      'Experienced specialist care'
    ],
    faqs: [
      {
        question: 'What is the success rate of the treatment?',
        answer: 'We have a very high success rate in treating hemorrhoids, fissures, and fistulas using advanced surgical techniques.'
      },
      {
        question: 'How long is the recovery period?',
        answer: 'Recovery time varies by procedure but typically ranges from 1-3 weeks with proper post-operative care.'
      }
    ]
  },
  {
    id: 'orthopedic',
    name: 'Orthopedic Consultation & Surgeries',
    description: 'Expert orthopedic care and surgical procedures',
    longDescription: 'Comprehensive orthopedic consultation and surgical services for bone, joint, and musculoskeletal conditions. Our experienced orthopedic surgeon provides both conservative and surgical treatment options.',
    icon: Bone,
    price: 650,
    doctors: [
      {
        id: '3',
        name: 'Dr. Ranjit Sah',
        specialty: 'Consultant Orthopedic Surgeon, MS Orthopedic',
        image: '/doctors/Ranjit Sah.jpg'
      }
    ],
    features: [
      'Comprehensive bone and joint care',
      'Fracture treatment and management',
      'Joint replacement surgeries',
      '7+ years of specialized experience'
    ],
    faqs: [
      {
        question: 'What orthopedic conditions do you treat?',
        answer: 'We treat fractures, joint problems, sports injuries, arthritis, back pain, and other musculoskeletal conditions.'
      },
      {
        question: 'How do I book an appointment?',
        answer: 'Appointments are available Monday-Friday, 11AM-2PM. Please book in advance through our booking system.'
      }
    ]
  },
  {
    id: 'ultrasound',
    name: 'Ultrasound (USG)',
    description: 'Abdominal and pelvic ultrasound imaging services',
    longDescription: 'Professional ultrasound imaging services for abdominal and pelvic examinations performed by experienced radiologists using state-of-the-art equipment.',
    icon: RadioTower,
    price: 950,
    doctors: [
      {
        id: '4',
        name: 'Dr. Bibek Joshi',
        specialty: 'Radiologist, USG Specialist, MBBS, MD',
        image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400'
      }
    ],
    features: [
      'Abdominal ultrasound',
      'Pelvic ultrasound',
      'Available Tuesday, Thursday, Saturday',
      '20+ years of experience'
    ],
    faqs: [
      {
        question: 'Do I need to prepare for an ultrasound?',
        answer: 'For abdominal ultrasound, fasting for 6-8 hours is recommended. For pelvic ultrasound, you may need a full bladder. Our staff will provide specific instructions.'
      },
      {
        question: 'When are ultrasound services available?',
        answer: 'Ultrasound services are available on Tuesday, Thursday, and Saturday. Please book an appointment in advance.'
      }
    ]
  },
  {
    id: 'ecg',
    name: 'ECG (Electrocardiogram)',
    description: 'Heart activity monitoring and diagnostic testing',
    longDescription: 'Electrocardiogram (ECG) testing to monitor heart activity and detect cardiac abnormalities. Quick, non-invasive procedure to assess heart health, performed by our trained nursing staff.',
    icon: Activity,
    price: 450,
    doctors: [
      {
        id: 'nurse-1',
        name: 'Available Nurse',
        specialty: 'Trained Clinical Nurse',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'
      }
    ],
    features: [
      'Quick and painless procedure',
      'Detects heart rhythm problems',
      'Available Sunday-Friday, 9AM-3PM',
      'Performed by trained nurses'
    ],
    faqs: [
      {
        question: 'What is an ECG used for?',
        answer: 'ECG is used to detect irregular heartbeats, heart attacks, heart disease, and other cardiac conditions.'
      },
      {
        question: 'How long does the test take?',
        answer: 'The ECG test typically takes about 5-10 minutes to complete.'
      }
    ]
  },
  {
    id: 'xray',
    name: 'X-Ray Imaging',
    description: 'Digital X-ray imaging with expert radiological reporting',
    longDescription: 'Comprehensive X-ray imaging services performed by trained technicians with expert radiological reporting by Dr. Laxman Kuwar. Modern digital X-ray equipment ensures clear images and accurate diagnoses.',
    icon: RadioTower,
    price: 550,
    doctors: [
      {
        id: 'tech-1',
        name: 'X-Ray Technician',
        specialty: 'Certified Radiologic Technician',
        image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'
      },
      {
        id: '6',
        name: 'Dr. Laxman Kuwar',
        specialty: 'Radiologist, X-ray Reporting Specialist, MBBS, MD',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400'
      }
    ],
    features: [
      'Digital X-ray imaging by certified technician',
      'Expert radiological reporting by Dr. Laxman Kuwar',
      'Available on appointment',
      '20+ years reporting experience'
    ],
    faqs: [
      {
        question: 'What types of X-rays do you provide?',
        answer: 'We provide X-rays for chest, bones, joints, abdomen, and other body parts as needed for diagnosis.'
      },
      {
        question: 'How quickly can I get results?',
        answer: 'X-ray results with radiological reports are typically available within 24 hours.'
      }
    ]
  },
  {
    id: 'gynecology-obstetrics',
    name: 'Gynecology & Obstetrics',
    description: 'Comprehensive women\'s health care, infertility treatment, and laparoscopic procedures',
    longDescription: 'Expert gynecological and obstetric care including prenatal and postnatal services, infertility treatment, and advanced laparoscopic surgeries for women\'s health conditions.',
    icon: Baby,
    price: 650,
    doctors: [
      {
        id: '8',
        name: 'Dr. Jitendra Singh',
        specialty: 'Obstetrician & Gynecologist, Laparoscopic Surgeon, Infertility Specialist',
        image: '/doctors/Jitendra Singh.jpg'
      }
    ],
    features: [
      'Prenatal and postnatal care',
      'Infertility consultation and treatment',
      'Laparoscopic gynecological surgeries',
      'Women\'s health check-ups'
    ],
    faqs: [
      {
        question: 'What gynecological services do you provide?',
        answer: 'We offer comprehensive women\'s health services including pregnancy care, infertility treatment, gynecological surgeries, and routine check-ups.'
      },
      {
        question: 'How do I book an appointment?',
        answer: 'Appointments are available on call. Please contact us to schedule your consultation with Dr. Jitendra Singh.'
      }
    ]
  },
  {
    id: 'neurology',
    name: 'Neurology',
    description: 'Expert neurological care for brain, nerve, and spinal conditions',
    longDescription: 'Comprehensive neurological services for diagnosis and treatment of nervous system disorders including headaches, epilepsy, stroke, and other neurological conditions.',
    icon: Brain,
    price: 800,
    doctors: [
      {
        id: '9',
        name: 'Dr. Jitendra Prasad Yadav',
        specialty: 'Senior Consultant Physician & Neurologist, MBBS, MD, FICN',
        image: '/doctors/Jitendra Prasad Yadav.jpg'
      }
    ],
    features: [
      'Headache and migraine treatment',
      'Epilepsy and seizure management',
      'Stroke care and prevention',
      'Nerve and spinal cord disorders'
    ],
    faqs: [
      {
        question: 'What neurological conditions do you treat?',
        answer: 'We treat headaches, migraines, epilepsy, stroke, Parkinson\'s disease, neuropathy, and other nervous system disorders.'
      },
      {
        question: 'When should I see a neurologist?',
        answer: 'Consult a neurologist for persistent headaches, seizures, numbness, weakness, memory problems, or other neurological symptoms.'
      }
    ]
  },
  {
    id: 'rheumatology-immunology',
    name: 'Rheumatology & Immunology',
    description: 'Specialized care for arthritis, autoimmune diseases, and immune system disorders',
    longDescription: 'Expert treatment for rheumatoid arthritis, lupus, and other autoimmune conditions. Our immunologist provides comprehensive care for immune system disorders.',
    icon: HeartPulse,
    price: 850,
    doctors: [
      {
        id: '5',
        name: 'Dr. Ram Krishna Giri',
        specialty: 'Consultant Immunologist and Rheumatologist, MBBS, MD, FCIR',
        image: '/doctors/Ram Krishna Giri.jpg'
      }
    ],
    features: [
      'Arthritis treatment and management',
      'Autoimmune disease care',
      'Joint pain and inflammation treatment',
      'Immune system disorder management'
    ],
    faqs: [
      {
        question: 'What conditions does a rheumatologist treat?',
        answer: 'We treat rheumatoid arthritis, osteoarthritis, lupus, gout, fibromyalgia, and other autoimmune and joint disorders.'
      },
      {
        question: 'When is the doctor available?',
        answer: 'Dr. Ram Krishna Giri is available every third Saturday of each month. Please book in advance.'
      }
    ]
  },
  {
    id: 'endocrinology',
    name: 'Endocrinology (Sugar & Thyroid Specialist)',
    description: 'Expert care for diabetes, thyroid disorders, and hormonal imbalances',
    longDescription: 'Comprehensive endocrinology services for diabetes management, thyroid disorders, and other hormonal conditions. Our specialist provides personalized treatment plans for metabolic and endocrine disorders.',
    icon: Droplet,
    price: 800,
    doctors: [
      {
        id: '7',
        name: 'Dr. Sukhesh Purush Dhakal',
        specialty: 'Senior Consultant Physician & Endocrinologist, MBBS, MD (HONS), Member ACP USA',
        image: '/doctors/Sukhesh Purush Dhakal.jpg'
      }
    ],
    features: [
      'Diabetes diagnosis and management',
      'Thyroid disorder treatment',
      'Hormonal imbalance care',
      'Metabolic syndrome management'
    ],
    faqs: [
      {
        question: 'What endocrine conditions do you treat?',
        answer: 'We treat diabetes (Type 1 & 2), thyroid disorders (hyperthyroidism, hypothyroidism), hormonal imbalances, and metabolic disorders.'
      },
      {
        question: 'How often should I monitor my diabetes?',
        answer: 'Monitoring frequency depends on your condition. Our endocrinologist will create a personalized monitoring and treatment plan for you.'
      }
    ]
  },
  {
    id: 'doctor-home-visit',
    name: 'Doctor Home Visit',
    description: 'Professional medical consultation in the comfort of your home',
    longDescription: 'Our home visit service brings qualified doctors to your doorstep, providing convenient and comprehensive medical care in the familiar environment of your home. Book an appointment for personalized care.',
    icon: Home,
    price: 1500,
    doctors: [
      {
        id: '2',
        name: 'Dr. Arbind Sah',
        specialty: 'Senior Consultant Physician, MD (Internal Medicine)',
        image: '/doctors/Arbind Sah.jpg'
      }
    ],
    features: [
      'Convenient home consultations',
      'Comprehensive check-ups',
      'Prescription and treatment plans',
      'Available upon appointment'
    ],
    faqs: [
      {
        question: 'How do I book a home visit?',
        answer: 'You can book a home visit through our online booking system or by calling our clinic. We arrange visits based on availability and urgency.'
      },
      {
        question: 'What types of medical issues can be handled during a home visit?',
        answer: 'Our doctors can handle most general medical issues, basic procedures, and routine check-ups. Emergency cases should visit the hospital.'
      }
    ]
  }
];
