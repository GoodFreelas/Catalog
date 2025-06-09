const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Identificação
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  nome: {
    type: String,
    required: true,
    index: true
  },
  codigo: String,

  // Preços e custos
  preco: { type: Number, default: 0 },
  preco_promocional: { type: Number, default: 0 },
  preco_custo: { type: Number, default: 0 },
  preco_custo_medio: { type: Number, default: 0 },

  // Classificações
  unidade: String,
  ncm: String,
  origem: String,
  gtin: String,
  gtin_embalagem: String,
  situacao: {
    type: String,
    enum: ['A', 'I'], // Ativo, Inativo
    default: 'A'
  },
  tipo: {
    type: String,
    enum: ['P', 'S'], // Produto, Serviço
    default: 'P'
  },

  // Estoque
  localizacao: String,
  peso_liquido: { type: Number, default: 0 },
  peso_bruto: { type: Number, default: 0 },
  estoque_minimo: { type: Number, default: 0 },
  estoque_maximo: { type: Number, default: 0 },

  // Fornecedor
  id_fornecedor: Number,
  nome_fornecedor: String,
  codigo_fornecedor: String,
  codigo_pelo_fornecedor: String,
  unidade_por_caixa: String,

  // Impostos
  classe_ipi: String,
  valor_ipi_fixo: String,
  cod_lista_servicos: String,
  cest: String,

  // Descrições
  descricao_complementar: String,
  garantia: String,
  obs: String,

  // Variações
  tipoVariacao: {
    type: String,
    enum: ['N', 'S'], // Não tem, Sim tem
    default: 'N'
  },
  variacoes: String,
  idProdutoPai: String,

  // Produção
  sob_encomenda: {
    type: String,
    enum: ['N', 'S'],
    default: 'N'
  },
  dias_preparacao: String,
  marca: String,

  // Embalagem
  tipoEmbalagem: String,
  alturaEmbalagem: String,
  comprimentoEmbalagem: String,
  larguraEmbalagem: String,
  diametroEmbalagem: String,
  qtd_volumes: String,

  // Categoria e classificação
  categoria: String,
  classe_produto: String,

  // Mídias
  anexos: [{
    anexo: String
  }],
  imagens_externas: [String],

  // SEO
  seo_title: String,
  seo_keywords: String,
  seo_description: String,
  link_video: String,
  slug: String,

  // Controle interno
  last_updated: {
    type: Date,
    default: Date.now
  },
  sync_date: {
    type: Date,
    default: Date.now,
    index: true
  },

  // Metadados
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  collection: 'products'
});

// Índices compostos para consultas otimizadas
productSchema.index({ situacao: 1, sync_date: -1 });
productSchema.index({ categoria: 1, situacao: 1 });
productSchema.index({ nome: 'text', descricao_complementar: 'text' }); // Busca textual

// Métodos do schema
productSchema.methods.isActive = function () {
  return this.situacao === 'A';
};

productSchema.methods.hasImages = function () {
  return this.anexos && this.anexos.length > 0;
};

productSchema.methods.getMainImage = function () {
  return this.anexos && this.anexos.length > 0 ? this.anexos[0].anexo : null;
};

// Métodos estáticos
productSchema.statics.findActive = function () {
  return this.find({ situacao: 'A' });
};

productSchema.statics.findByCategory = function (category) {
  return this.find({ categoria: category, situacao: 'A' });
};

productSchema.statics.searchByName = function (searchTerm) {
  return this.find({
    $text: { $search: searchTerm },
    situacao: 'A'
  });
};

// Middleware pre-save
productSchema.pre('save', function (next) {
  this.last_updated = new Date();
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;