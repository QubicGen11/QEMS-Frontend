const config = {
    // apiUrl: 'https://qubinest-ems-backend.vercel.app'
    apiUrl: 'https://qemsbe.qubinest.com',
    // apiUrl: 'http://localhost:3000', // Localhost URL
    allowedNetworks: [
      {
        ssid: 'YourCompanyWiFi', // Replace with your company WiFi name
        subnet: '192.168.1.0/24' // Replace with your company WiFi subnet
      }
      // Add more networks if needed
    ]
  };

export default config;
  