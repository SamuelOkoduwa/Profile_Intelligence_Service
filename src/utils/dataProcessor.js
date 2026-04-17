// Helper function to classify age into groups
const classifyAgeGroup = (age) => {
  if (age >= 0 && age <= 12) return 'child';
  if (age >= 13 && age <= 19) return 'teenager';
  if (age >= 20 && age <= 59) return 'adult';
  if (age >= 60) return 'senior';
  return null;
};

// Validate profile data from external APIs
const validateProfileData = (genderData, ageData, nationalityData) => {
  // Check if gender data is valid
  if (!genderData || genderData.gender === null || genderData.count === 0) {
    return { valid: false, error: 'Genderize returned an invalid response' };
  }

  // Check if age data is valid
  if (!ageData || ageData.age === null) {
    return { valid: false, error: 'Agify returned an invalid response' };
  }

  // Check if nationality data is valid
  if (!nationalityData || !nationalityData.country || nationalityData.country.length === 0) {
    return { valid: false, error: 'Nationalize returned an invalid response' };
  }

  return { valid: true };
};

// Process and aggregate data from all three APIs
const processProfileData = (name, genderData, ageData, nationalityData) => {
  const validation = validateProfileData(genderData, ageData, nationalityData);
  
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Get the country with highest probability
  const topCountry = nationalityData.country.reduce((prev, current) => 
    prev.probability > current.probability ? prev : current
  );

  return {
    success: true,
    data: {
      name: name.toLowerCase(),
      gender: genderData.gender,
      gender_probability: parseFloat(genderData.probability.toFixed(2)),
      sample_size: genderData.count,
      age: ageData.age,
      age_group: classifyAgeGroup(ageData.age),
      country_id: topCountry.country_id,
      country_probability: parseFloat(topCountry.probability.toFixed(2))
    }
  };
};

module.exports = {
  classifyAgeGroup,
  validateProfileData,
  processProfileData
};
