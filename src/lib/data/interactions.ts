type Severity = 'safe' | 'moderate' | 'danger'

interface Interaction {
  severity: Severity
  message: string
}

export const interactions: Record<string, Interaction> = {
  'Acetaminophen-Warfarin': {
    severity: 'moderate',
    message: 'Enhanced anticoagulant effect — monitor INR closely, especially at higher acetaminophen doses.'
  },
  'Acetaminophen-Ibuprofen': {
    severity: 'safe',
    message: 'Safe to alternate for pain and fever management at standard doses.'
  },
  'Aspirin-Ibuprofen': {
    severity: 'danger',
    message: 'Ibuprofen competitively blocks aspirin\'s irreversible platelet inhibition, reducing its cardioprotective effect. Combined use also raises GI bleed risk.'
  },
  'Aspirin-Warfarin': {
    severity: 'danger',
    message: 'Major bleeding risk from additive anticoagulant and antiplatelet effects. Avoid unless explicitly directed by a physician.'
  },
  'Aspirin-Sertraline': {
    severity: 'moderate',
    message: 'Combined SSRI and NSAID use increases the risk of GI bleeding. Use with caution and consider a PPI if co-prescribed.'
  },
  'Atorvastatin-Amlodipine': {
    severity: 'moderate',
    message: 'Amlodipine inhibits CYP3A4 and can raise atorvastatin plasma levels. Limit atorvastatin to 20 mg/day with this combination.'
  },
  'Atorvastatin-Azithromycin': {
    severity: 'moderate',
    message: 'Azithromycin may transiently inhibit CYP3A4, increasing statin exposure. Monitor for signs of myopathy during short-course therapy.'
  },
  'Azithromycin-Warfarin': {
    severity: 'moderate',
    message: 'Azithromycin alters gut flora, reducing vitamin K synthesis and potentiating warfarin. Monitor INR after starting or stopping the antibiotic.'
  },
  'Amoxicillin-Warfarin': {
    severity: 'moderate',
    message: 'Broad-spectrum antibiotics may potentiate anticoagulant effect by reducing gut vitamin K production. Check INR within a week of starting therapy.'
  },
  'Ciprofloxacin-Warfarin': {
    severity: 'danger',
    message: 'Significant and consistent INR elevation reported. Ciprofloxacin inhibits warfarin metabolism — reduce dose and monitor INR every 2–3 days.'
  },
  'Ibuprofen-Warfarin': {
    severity: 'danger',
    message: 'NSAIDs inhibit platelet aggregation and may elevate INR. Serious GI and intracranial bleeding risk — avoid if possible or monitor very closely.'
  },
  'Ibuprofen-Prednisolone': {
    severity: 'moderate',
    message: 'Combined use significantly increases the risk of GI ulceration and bleeding. Use the lowest effective doses and consider a PPI.'
  },
  'Levothyroxine-Omeprazole': {
    severity: 'moderate',
    message: 'PPIs reduce gastric acidity and can impair levothyroxine absorption. Separate doses by at least 4 hours or take levothyroxine at bedtime.'
  },
  'Levothyroxine-Metformin': {
    severity: 'safe',
    message: 'No clinically significant pharmacokinetic or pharmacodynamic interaction at standard doses.'
  },
  'Metformin-Prednisolone': {
    severity: 'moderate',
    message: 'Corticosteroids raise blood glucose and antagonize metformin\'s hypoglycaemic action. Monitor blood glucose and adjust metformin dose as needed.'
  },
  'Metformin-Amlodipine': {
    severity: 'safe',
    message: 'No significant pharmacokinetic or pharmacodynamic interaction at therapeutic doses.'
  },
  'Omeprazole-Clopidogrel': {
    severity: 'danger',
    message: 'Omeprazole inhibits CYP2C19, reducing conversion of clopidogrel to its active metabolite. This blunts antiplatelet effect and increases thromboembolic risk.'
  },
  'Prednisolone-Warfarin': {
    severity: 'moderate',
    message: 'Corticosteroids can alter warfarin response unpredictably — both increases and decreases in INR have been reported. Monitor INR closely during initiation and dose changes.'
  },
  'Sertraline-Tramadol': {
    severity: 'danger',
    message: 'High risk of serotonin syndrome. Both agents increase serotonergic activity. Symptoms include agitation, hyperthermia, and seizures — potentially life-threatening.'
  },
  'Sertraline-Ibuprofen': {
    severity: 'moderate',
    message: 'SSRIs inhibit platelet serotonin uptake; combined with an NSAID this substantially increases GI bleeding risk. Monitor closely or add gastroprotection.'
  },
  'Sertraline-Warfarin': {
    severity: 'moderate',
    message: 'SSRIs may enhance warfarin\'s anticoagulant effect through reduced platelet function and possible pharmacokinetic interaction. Monitor INR.'
  },
  'Simvastatin-Amlodipine': {
    severity: 'moderate',
    message: 'Amlodipine raises simvastatin exposure through CYP3A4 inhibition. Do not exceed simvastatin 20 mg/day with amlodipine 10 mg — myopathy and rhabdomyolysis risk.'
  },
  'Warfarin-Paracetamol': {
    severity: 'moderate',
    message: 'Paracetamol (acetaminophen) may enhance warfarin\'s anticoagulant effect, particularly at doses above 2 g/day. Monitor INR with regular use.'
  },
  'Cetirizine-Alcohol': {
    severity: 'moderate',
    message: 'Additive CNS depression — sedation, impaired coordination, and slowed reaction time. Avoid driving or operating machinery when combining these.'
  },
  'Metronidazole-Warfarin': {
    severity: 'danger',
    message: 'Metronidazole markedly inhibits warfarin metabolism via CYP2C9. INR can double or triple — reduce warfarin dose empirically and monitor every 2–3 days.'
  }
}
