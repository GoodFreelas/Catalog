import React, { useState, useEffect } from "react";
import {
  Sync,
  Database,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "../atoms/Button";
import { Badge } from "../atoms/Badge";
import { LocalAPI } from "../../services/LocalAPI";

export const SyncDashboard = ({ isOpen, onClose }) => {
  const [syncStatus, setSyncStatus] = useState(null);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
      // Atualizar a cada 5 segundos quando dashboard estiver aberto
      const interval = setInterval(loadData, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [statusData, statsData, logsData] = await Promise.all([
        LocalAPI.getSyncStatus(),
        LocalAPI.getStats(),
        LocalAPI.getSyncLogs(),
      ]);

      setSyncStatus(statusData);
      setStats(statsData);
      setLogs(logsData.logs);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    }
  };

  const handleStartSync = async () => {
    setLoading(true);
    try {
      await LocalAPI.startSync();
      alert("Sincronização iniciada! Acompanhe o progresso no dashboard.");
      loadData();
    } catch (error) {
      alert(`Erro ao iniciar sincronização: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  const formatDuration = (start, end) => {
    if (!start || !end) return "N/A";
    const duration = (new Date(end) - new Date(start)) / 1000 / 60; // minutos
    return `${Math.round(duration)} min`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-xl overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Dashboard de Sincronização
              </h2>
            </div>
            <Button variant="secondary" onClick={onClose}>
              Fechar
            </Button>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Status da Sincronização */}
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {syncStatus?.isRunning ? (
                      <>
                        <Sync className="w-4 h-4 text-blue-500 animate-spin" />
                        <Badge variant="primary">Rodando</Badge>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <Badge variant="success">Parado</Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Total de Produtos */}
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Produtos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {syncStatus?.totalProducts || 0}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>

            {/* Produtos com Imagem */}
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Com Imagem</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.stats?.comImagem || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats?.stats?.total > 0
                      ? `${Math.round(
                          (stats.stats.comImagem / stats.stats.total) * 100
                        )}%`
                      : "0%"}
                  </p>
                </div>
              </div>
            </div>

            {/* Última Sincronização */}
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Última Sync</p>
                  <p className="text-sm font-medium text-gray-900">
                    {stats?.lastSync?.endTime
                      ? formatDate(stats.lastSync.endTime)
                      : "Nunca"}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Controles de Sincronização
                </h3>
                <p className="text-sm text-gray-600">
                  Gerencie a sincronização com a API Tiny
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleStartSync}
                  disabled={loading || syncStatus?.isRunning}
                  className="flex items-center gap-2"
                >
                  <Sync
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                  {syncStatus?.isRunning ? "Sincronizando..." : "Iniciar Sync"}
                </Button>
                <Button variant="outline" onClick={loadData}>
                  Atualizar
                </Button>
              </div>
            </div>
          </div>

          {/* Estatísticas Detalhadas */}
          {stats && (
            <div className="bg-white border rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Estatísticas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.stats?.total || 0}
                  </p>
                  <p className="text-sm text-gray-600">Total de Produtos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {stats.stats?.comImagem || 0}
                  </p>
                  <p className="text-sm text-gray-600">Com Imagens</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.stats?.promocoes || 0}
                  </p>
                  <p className="text-sm text-gray-600">Em Promoção</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    R$ {(stats.stats?.precoMedio || 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">Preço Médio</p>
                </div>
              </div>
            </div>
          )}

          {/* Log da Última Sincronização */}
          {syncStatus?.lastSync && (
            <div className="bg-white border rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Última Sincronização
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge
                    variant={
                      syncStatus.lastSync.status === "completed"
                        ? "success"
                        : syncStatus.lastSync.status === "failed"
                        ? "danger"
                        : "warning"
                    }
                  >
                    {syncStatus.lastSync.status === "completed"
                      ? "Concluída"
                      : syncStatus.lastSync.status === "failed"
                      ? "Falhou"
                      : "Rodando"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duração</p>
                  <p className="font-medium">
                    {formatDuration(
                      syncStatus.lastSync.startTime,
                      syncStatus.lastSync.endTime
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Novos</p>
                  <p className="font-medium text-green-600">
                    {syncStatus.lastSync.newProducts || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Atualizados</p>
                  <p className="font-medium text-blue-600">
                    {syncStatus.lastSync.updatedProducts || 0}
                  </p>
                </div>
              </div>

              {syncStatus.lastSync.errors > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-800">
                      {syncStatus.lastSync.errors} erro(s) encontrado(s)
                    </span>
                  </div>
                  {syncStatus.lastSync.errorDetails && (
                    <div className="text-xs text-red-700 max-h-20 overflow-y-auto">
                      {syncStatus.lastSync.errorDetails
                        .slice(0, 3)
                        .map((error, index) => (
                          <div key={index} className="mb-1">
                            {error}
                          </div>
                        ))}
                      {syncStatus.lastSync.errorDetails.length > 3 && (
                        <div>
                          ... e mais{" "}
                          {syncStatus.lastSync.errorDetails.length - 3} erros
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Histórico de Sincronizações */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Histórico de Sincronizações
            </h3>

            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhuma sincronização encontrada
              </p>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          log.status === "completed"
                            ? "success"
                            : log.status === "failed"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {log.status === "completed"
                          ? "Sucesso"
                          : log.status === "failed"
                          ? "Falha"
                          : "Rodando"}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">
                          {formatDate(log.startTime)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {log.totalProducts} produtos •{" "}
                          {formatDuration(log.startTime, log.endTime)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-sm">
                      <div className="text-green-600">
                        +{log.newProducts || 0} novos
                      </div>
                      <div className="text-blue-600">
                        ~{log.updatedProducts || 0} atualizados
                      </div>
                      {log.errors > 0 && (
                        <div className="text-red-600">{log.errors} erros</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
