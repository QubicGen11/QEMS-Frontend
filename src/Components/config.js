const config = {
    // apiUrl: 'http://localhost:3000',
    apiUrl: 'https://qemsbe.qubinest.com',
    serverConfig: {
      publicIP: '74.179.60.127',
      privateIP: '10.0.0.4'
  },
  
  allowedNetworks: [
      {
          cidr: '192.168.29.0/16',
          subnet: '255.255.255.0',
          gateway: '192.168.29.1',
          description: 'Office Network 1'
      },
      {
          cidr: '192.168.1.0/16',
          subnet: '255.255.255.0',
          gateway: '192.168.1.1',
          description: 'Office Network 2'
      }
  ]
};

export default config;
  