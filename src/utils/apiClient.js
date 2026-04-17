const axios = require('axios');

const GENDERIZE_URL = 'https://api.genderize.io';
const AGIFY_URL = 'https://api.agify.io';
const NATIONALIZE_URL = 'https://api.nationalize.io';

// Call Genderize API
const callGenderizeAPI = async (name) => {
  try {
    const response = await axios.get(GENDERIZE_URL, {
      params: { name: name }
    });
    return {
      success: true,
      data: {
        gender: response.data.gender,
        probability: response.data.probability,
        count: response.data.count
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Genderize API call failed'
    };
  }
};

// Call Agify API
const callAgifyAPI = async (name) => {
  try {
    const response = await axios.get(AGIFY_URL, {
      params: { name: name }
    });
    return {
      success: true,
      data: {
        age: response.data.age,
        count: response.data.count
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Agify API call failed'
    };
  }
};

// Call Nationalize API
const callNationalizeAPI = async (name) => {
  try {
    const response = await axios.get(NATIONALIZE_URL, {
      params: { name: name }
    });
    return {
      success: true,
      data: {
        country: response.data.country || []
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Nationalize API call failed'
    };
  }
};

// Call all three APIs in parallel
const enrichProfileWithAPIs = async (name) => {
  try {
    const [genderRes, ageRes, nationalityRes] = await Promise.all([
      callGenderizeAPI(name),
      callAgifyAPI(name),
      callNationalizeAPI(name)
    ]);

    return {
      success: genderRes.success && ageRes.success && nationalityRes.success,
      genderData: genderRes.data,
      ageData: ageRes.data,
      nationalityData: nationalityRes.data,
      error: genderRes.error || ageRes.error || nationalityRes.error
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to enrich profile with APIs'
    };
  }
};

module.exports = {
  enrichProfileWithAPIs,
  callGenderizeAPI,
  callAgifyAPI,
  callNationalizeAPI
};
