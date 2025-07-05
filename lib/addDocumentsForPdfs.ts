import { db } from "@/lib/firebase";
import { collection, doc, writeBatch } from "firebase/firestore";


export async function addDocumentsForPdfs() {
  // await giSystem();
  // await cardiovascularSystem();
  // await respiratory();
  // await centralNervousSystem();
  // await infections();
  // await endocrine();
  await obstetricsGynecologyUrinaryTract();
}

async function giSystem() {
  const collectionName = "gi-system";
  const folderName = "gi-system";

  try {
    const cnsCollection = collection(db, collectionName);
    const batch = writeBatch(db);
    const documents = [
      { fileName: "PPI_Guidance.pdf", storagePath: `${folderName}/PPI_Guidance.pdf` },
      { fileName: "Primary_Care_management_of_IBS-fh.pdf", storagePath: `${folderName}/Primary_Care_management_of_IBS-fh.pdf` },
      { fileName: "GORD_in_children_and_young_people.pdf", storagePath: `${folderName}/GORD_in_children_and_young_people.pdf` },
      { fileName: "Dyspepsia_&_GORD.pdf", storagePath: `${folderName}/Dyspepsia_&_GORD.pdf` },
      { fileName: "Constipation_Prucalopride_&_Lubipristone.pdf", storagePath: `${folderName}/Constipation_Prucalopride_&_Lubipristone.pdf` },
      { fileName: "Alternatives_to_Questran_cholestyramine.pdf", storagePath: `${folderName}/Alternatives_to_Questran_cholestyramine.pdf` },
      { fileName: "Chapter_1_GI_System.pdf", storagePath: `${folderName}/Chapter_1_GI_System.pdf` },
    ];

    for (const docData of documents) {
      const newDocRef = doc(cnsCollection); // Auto-generated ID
      batch.set(newDocRef, docData);
    }
    await batch.commit();
    console.log("✅ All documents written successfully in a batch");
  } catch (error) {
    console.error("❌ Error writing batch to Firestore:", error);
  }
}

async function cardiovascularSystem() {
  const collectionName = "cardiovascular-system";
  const folderName = "cardiovascular-system";

  try {
    const cnsCollection = collection(db, collectionName);
    const batch = writeBatch(db);

    const documents = [
      { fileName: "Guidance_for_LMWH_prescribing.pdf", storagePath: `${folderName}/Guidance_for_LMWH_prescribing.pdf` },
      { fileName: "Lipid_modification_therapy_in_non-fh.pdf", storagePath: `${folderName}/Lipid_modification_therapy_in_non-fh.pdf` },
      { fileName: "Familial_hypercholesterolaemia.pdf", storagePath: `${folderName}/Familial_hypercholesterolaemia.pdf` },
      { fileName: "Midodrine.pdf", storagePath: `${folderName}/Midodrine.pdf` },
      { fileName: "Hypertension.pdf", storagePath: `${folderName}/Hypertension.pdf` },
      { fileName: "Heart_failure.pdf", storagePath: `${folderName}/Heart_failure.pdf` },
      { fileName: "Atrial_fibrillation.pdf", storagePath: `${folderName}/Atrial_fibrillation.pdf` },
      { fileName: "Oral_anticoagulation.pdf", storagePath: `${folderName}/Oral_anticoagulation.pdf` },
      { fileName: "ACS_dual_antiplatelet.pdf", storagePath: `${folderName}/ACS_dual_antiplatelet.pdf` },
      { fileName: "Chapter_2_Cardiovascular_disease.pdf", storagePath: `${folderName}/Chapter_2_Cardiovascular_disease.pdf` },
    ];

    for (const docData of documents) {
      const newDocRef = doc(cnsCollection); // Auto-generated ID
      batch.set(newDocRef, docData);
    }

    await batch.commit();
    console.log("✅ All documents written successfully in a batch");
  } catch (error) {
    console.error("❌ Error writing batch to Firestore:", error);
  }
}

async function respiratory() {
  const collectionName = "respiratory";
  const folderName = "respiratory";

  try {
    const cnsCollection = collection(db, collectionName);
    const batch = writeBatch(db);

    const documents = [
      { fileName: "Oxygen_in_COPD_guidelines.pdf", storagePath: `${folderName}/Oxygen_in_COPD_guidelines.pdf` },
      { fileName: "Greener_Inhaler_Prescribing_Guidance.pdf", storagePath: `${folderName}/Greener_Inhaler_Prescribing_Guidance.pdf` },
      { fileName: "COPD_management.pdf", storagePath: `${folderName}/COPD_management.pdf` },
      { fileName: "GP_referal_for_SLIT_paediatrics.pdf", storagePath: `${folderName}/GP_referal_for_SLIT_paediatrics.pdf` },
      { fileName: "Childrens_Asthma.pdf", storagePath: `${folderName}/Childrens_Asthma.pdf` },
      { fileName: "Asthma_management_in_adults.pdf", storagePath: `${folderName}/Asthma_management_in_adults.pdf` },
      { fileName: "Adult Asthma Treatment Algorithm NICE 2024 Update.pdf", storagePath: `${folderName}/Adult Asthma Treatment Algorithm NICE 2024 Update.pdf` },
      { fileName: "Chapter_3_Respiratory_system.pdf", storagePath: `${folderName}/Chapter_3_Respiratory_system.pdf` },
    ];

    for (const docData of documents) {
      const newDocRef = doc(cnsCollection); // Auto-generated ID
      batch.set(newDocRef, docData);
    }

    await batch.commit();
    console.log("✅ All documents written successfully in a batch");
  } catch (error) {
    console.error("❌ Error writing batch to Firestore:", error);
  }
}

async function centralNervousSystem() {
  const collectionName = "central-nervous-system";
  const folderName = "central-nervous-system";

  try {
    const cnsCollection = collection(db, collectionName);
    const batch = writeBatch(db);

    const documents = [
      { fileName: "Nicotine_replacement_therapy.pdf", storagePath: `${folderName}/Nicotine_replacement_therapy.pdf` },
      { fileName: "Sativex_for_spasticity_in_MS.pdf", storagePath: `${folderName}/Sativex_for_spasticity_in_MS.pdf` },
      { fileName: "Strong_opioids_in_cancer_pain.pdf", storagePath: `${folderName}/Strong_opioids_in_cancer_pain.pdf` },
      { fileName: "Non-malignant_chronic_pain.pdf", storagePath: `${folderName}/Non-malignant_chronic_pain.pdf` },
      { fileName: "Neuropathic_Pain.pdf", storagePath: `${folderName}/Neuropathic_Pain.pdf` },
      { fileName: "Nefopam_position_statement.pdf", storagePath: `${folderName}/Nefopam_position_statement.pdf` },
      { fileName: "Deprescribing_and_Safer_prescribing_of_strong_opioids_in_non-malignant_pain.pdf", storagePath: `${folderName}/Deprescribing_and_Safer_prescribing_of_strong_opioids_in_non-malignant_pain.pdf` },
      { fileName: "Midazolam_for_primary_care.pdf", storagePath: `${folderName}/Midazolam_for_primary_care.pdf` },
      { fileName: "Metoclopramide_in_gastro-paresis.pdf", storagePath: `${folderName}/Metoclopramide_in_gastro-paresis.pdf` },
      { fileName: "Liothyronine for treatment resistant depression.pdf", storagePath: `${folderName}/Liothyronine for treatment resistant depression.pdf` },
      { fileName: "Melatonin_information_sheet.pdf", storagePath: `${folderName}/Melatonin_information_sheet.pdf` },
      { fileName: "Insomnia_Daridorexant_prescribing_guideline.pdf", storagePath: `${folderName}/Insomnia_Daridorexant_prescribing_guideline.pdf` },
      { fileName: "Domperidone_off_licence_use.pdf", storagePath: `${folderName}/Domperidone_off_licence_use.pdf` },
      { fileName: "Antidepressant_choice_in_depression.pdf", storagePath: `${folderName}/Antidepressant_choice_in_depression.pdf` },
      { fileName: "Behaviour_Problems_in_Patients_with_Dementia.pdf", storagePath: `${folderName}/Behaviour_Problems_in_Patients_with_Dementia.pdf` },
      { fileName: "Management_of_Dementia_in_primary_care.pdf", storagePath: `${folderName}/Management_of_Dementia_in_primary_care.pdf` },
      { fileName: "Chloral_hydrate_position_statement.pdf", storagePath: `${folderName}/Chloral_hydrate_position_statement.pdf` },
      { fileName: "Antipsychotics_Prescribing_and_Management.pdf", storagePath: `${folderName}/Antipsychotics_Prescribing_and_Management.pdf` },
      { fileName: "Antipsychotics_Clozapine_GPs_and_other_healthcare_professionals.pdf", storagePath: `${folderName}/Antipsychotics_Clozapine_GPs_and_other_healthcare_professionals.pdf` },
      { fileName: "Chapter_4_CNS.pdf", storagePath: `${folderName}/Chapter_4_CNS.pdf` },
    ];

    for (const docData of documents) {
      const newDocRef = doc(cnsCollection); // Auto-generated ID
      batch.set(newDocRef, docData);
    }

    await batch.commit();
    console.log("✅ All documents written successfully in a batch");
  } catch (error) {
    console.error("❌ Error writing batch to Firestore:", error);
  }
}

async function infections() {
  const collectionName = "infections";
  const folderName = "infections";

  try {
    const cnsCollection = collection(db, collectionName);
    const batch = writeBatch(db);

    const documents = [
      { fileName: "Management_of_Lower_UTI_in_CKD.pdf", storagePath: `${folderName}/Management_of_Lower_UTI_in_CKD.pdf` },
      { fileName: "Oral_Thrush_In_Babies.pdf", storagePath: `${folderName}/Oral_Thrush_In_Babies.pdf` },
      { fileName: "OPAT_step_up_policy.pdf", storagePath: `${folderName}/OPAT_step_up_policy.pdf` },
      { fileName: "Onychomycosis-Guideline.pdf", storagePath: `${folderName}/Onychomycosis-Guideline.pdf` },
      { fileName: "Nebulised_Colomycin.pdf", storagePath: `${folderName}/Nebulised_Colomycin.pdf` },
      { fileName: "Chlamydia_Testing_and_Screening.pdf", storagePath: `${folderName}/Chlamydia_Testing_and_Screening.pdf` },
      { fileName: "Chicken_pox_in_pregnancy_neonates.pdf", storagePath: `${folderName}/Chicken_pox_in_pregnancy_neonates.pdf` },
      { fileName: "Management_of_C_diff_infection.pdf", storagePath: `${folderName}/Management_of_C_diff_infection.pdf` },
      { fileName: "summary_antimicrobial_prescribing_guidance.pdf", storagePath: `${folderName}/summary_antimicrobial_prescribing_guidance.pdf` },
    ];

    for (const docData of documents) {
      const newDocRef = doc(cnsCollection); // Auto-generated ID
      batch.set(newDocRef, docData);
    }

    await batch.commit();
    console.log("✅ All documents written successfully in a batch");
  } catch (error) {
    console.error("❌ Error writing batch to Firestore:", error);
  }
}

async function endocrine() {
  const collectionName = "endocrine";
  const folderName = "endocrine";

  try {
    const cnsCollection = collection(db, collectionName);
    const batch = writeBatch(db);

    const documents = [
      { fileName: "Osteoporosis_Guideline.pdf", storagePath: `${folderName}/Osteoporosis_Guideline.pdf` },
      { fileName: "Bisphosphonate_length_of_treatment_in_osteoporosis.pdf", storagePath: `${folderName}/Bisphosphonate_length_of_treatment_in_osteoporosis.pdf` },
      { fileName: "Menopause_Guideline.pdf", storagePath: `${folderName}/Menopause_Guideline.pdf` },
      { fileName: "Liothyronine_position_statement.pdf", storagePath: `${folderName}/Liothyronine_position_statement.pdf` },
      { fileName: "Cabergoline_&_Quinagolide.pdf", storagePath: `${folderName}/Cabergoline_&_Quinagolide.pdf` },
      { fileName: "Finerenone Prescribing guidance for Primary Care.pdf", storagePath: `${folderName}/Finerenone Prescribing guidance for Primary Care.pdf` },
      { fileName: "Diabetes_glucose_monitoring_interim_position_statement.pdf", storagePath: `${folderName}/Diabetes_glucose_monitoring_interim_position_statement.pdf` },
      { fileName: "Glucose_control_in_Type_2_Diabetes.pdf", storagePath: `${folderName}/Glucose_control_in_Type_2_Diabetes.pdf` },
      { fileName: "Freestyle_Libre.pdf", storagePath: `${folderName}/Freestyle_Libre.pdf` },
      { fileName: "Blood_glucose_monitoring_meter_formulary.pdf", storagePath: `${folderName}/Blood_glucose_monitoring_meter_formulary.pdf` },
      { fileName: "Cinacalcet_guidance_on_prescribing_and_monitoring.pdf", storagePath: `${folderName}/Cinacalcet_guidance_on_prescribing_and_monitoring.pdf` },
      { fileName: "Chapter_6_Endocrine.pdf", storagePath: `${folderName}/Chapter_6_Endocrine.pdf` },
    ];

    for (const docData of documents) {
      const newDocRef = doc(cnsCollection); // Auto-generated ID
      batch.set(newDocRef, docData);
    }

    await batch.commit();
    console.log("✅ All documents written successfully in a batch");
  } catch (error) {
    console.error("❌ Error writing batch to Firestore:", error);
  }
}

async function obstetricsGynecologyUrinaryTract() {
  const collectionName = "obstetrics-gynecology-urinary-tract";
  const folderName = "obstetrics-gynecology-urinary-tract";

  try {
    const cnsCollection = collection(db, collectionName);
    const batch = writeBatch(db);

    const documents = [
      { fileName: "Sayana_Press_Protocol.pdf", storagePath: `${folderName}/Sayana_Press_Protocol.pdf` },
      { fileName: "Emergency_contraception.pdf", storagePath: `${folderName}/Emergency_contraception.pdf` },
      { fileName: "Continence_PG_Community_Formulary.pdf", storagePath: `${folderName}/Continence_PG_Community_Formulary.pdf` },
      { fileName: "Chapter_7_Obs_gynae_urinary_tract_disorders.pdf", storagePath: `${folderName}/Chapter_7_Obs_gynae_urinary_tract_disorders.pdf` },
    ];

    for (const docData of documents) {
      const newDocRef = doc(cnsCollection); // Auto-generated ID
      batch.set(newDocRef, docData);
    }

    await batch.commit();
    console.log("✅ All documents written successfully in a batch");
  } catch (error) {
    console.error("❌ Error writing batch to Firestore:", error);
  }
}
