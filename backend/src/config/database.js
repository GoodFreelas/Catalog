// External Libraries
const mongoose = require('mongoose');

// Utilities
const { logger } = require('../utils/logger');

// ================================
// Database Connection
// ================================

/**
 * Conecta ao banco de dados MongoDB
 * Configura conexão com opções otimizadas e handlers de eventos
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tiny_products';

    // Opções simplificadas para compatibilidade
    const options = {
      serverSelectionTimeoutMS: 5000, // 5 segundos para conectar
      socketTimeoutMS: 45000, // 45 segundos de timeout
      maxPoolSize: 10 // Máximo 10 conexões no pool
    };

    const conn = await mongoose.connect(mongoURI, options);

    logger.info(`✅ MongoDB conectado: ${conn.connection.host}`);

    // Event handlers
    mongoose.connection.on('error', (error) => {
      logger.error('❌ Erro de conexão MongoDB:', error.message);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB desconectado');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('🔄 MongoDB reconectado');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('🔌 Conexão MongoDB fechada devido ao encerramento da aplicação');
      process.exit(0);
    });

  } catch (error) {
    logger.error('❌ Erro ao conectar ao MongoDB:', error.message);
    process.exit(1);
  }
};

// ================================
// Export
// ================================

module.exports = connectDB;