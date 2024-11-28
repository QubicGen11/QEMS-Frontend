const config = {
    // apiUrl: 'http://localhost:3000',
    apiUrl: 'https://qemsbe.qubinest.com',
    allowedNetworks: [
      {
        network: '192.168.29.0',
        subnet: '255.255.255.0',
        gateway: '192.168.29.1',
        ipv6: '2405:201:c052:1888',
        interface: 'WiFi'
      },
      {
        // Second office network
        network: '192.168.1.0',
        subnet: '255.255.255.0',
        gateway: '192.168.1.1',
        ipv6: '2401:4900:1cb0:2fb0',
        interface: 'WiFi'
      }
    ]
};

export default config;
  