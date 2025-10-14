// src/app/favoritos/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Favorite, Snapshot } from '@/types';
import {
  loadFavorites,
  removeFavorite,
  saveFavorites,
  getHistoryKey,
  upsertHistory,
  saveHistory,
  createProductGroup,
  loadProductGroups,
  addProductToGroup,
  removeProductFromGroup,
  deleteProductGroup,
  updateGroupName,
} from '@/lib/utils';
import FavoritesList from '@/components/FavoritesList';
import ComparePanel from '@/components/ComparePanel';
import CompareChart, { makeCompareSeries } from '@/components/CompareChart';
import GroupManagementModal from '@/components/GroupManagementModal';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';
import { fetchProductWithCache, detectProvider } from '@/lib/product-fetch';

export default function FavoritosPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [compareSelected, setCompareSelected] = useState<string[]>([]);
  const [compareMetric, setCompareMetric] = useState<'vista' | 'parcelado' | 'original'>('vista');

  const [loadingSelected, setLoadingSelected] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [shimmeringIds, setShimmeringIds] = useState<string[]>([]);

  const [latestById, setLatestById] = useState<Record<string, Snapshot | undefined>>({});
  const [prevById, setPrevById] = useState<Record<string, Snapshot | undefined>>({});

  // Estados do modal de gerenciamento de grupos
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedProductForGroup, setSelectedProductForGroup] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Favoritos — Price Watcher | Acompanhe Seus Produtos';
  }, []);

  useEffect(() => {
    async function hydrateMeta(list: Favorite[]) {
      const toFix = list.filter(f => !f.name || !f.image).map(f => f.id);
      if (!toFix.length) return;
      setShimmeringIds(prev => [...new Set([...prev, ...toFix])]);
      try {
        for (const id of toFix) await fetchAndUpsert(id, { silent: true });
        syncSnapshots(toFix);
      } finally {
        setShimmeringIds(prev => prev.filter(id => !toFix.includes(id)));
      }
    }

    async function init() {
      const favs = loadFavorites();
      loadProductGroups(); // Carrega grupos (usado internamente por componentes)
      setFavorites(favs);
      await hydrateMeta(favs);
    }
    void init();
  }, []);

  useEffect(() => {
    syncSnapshots(favorites.map(f => f.id));
  }, [favorites]);

  useEffect(() => {
    const onAuto = (e: Event) => {
      const detail = (e as CustomEvent).detail as { ids?: string[] } | undefined;
      const ids = detail?.ids ?? favorites.map(f => f.id);
      syncSnapshots(ids);
    };
    window.addEventListener('pw:auto-refresh', onAuto as EventListener);
    return () => window.removeEventListener('pw:auto-refresh', onAuto as EventListener);
  }, [favorites]);

  const deleteFavorite = (id: string) => {
    removeFavorite(id);
    const nextFavs = favorites.filter(f => f.id !== id);
    setFavorites(nextFavs);
    saveFavorites(nextFavs);
    setCompareSelected(prev => prev.filter(x => x !== id));
    setLatestById(prev => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _removed1, ...rest } = prev;
      return rest;
    });
    setPrevById(prev => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _removed2, ...rest } = prev;
      return rest;
    });
    toast.success('Removido dos favoritos.');
  };

  const toggleCompare = (id: string) => {
    setCompareSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const removeFromCompare = (id: string) => setCompareSelected(prev => prev.filter(x => x !== id));
  const clearCompare = () => setCompareSelected([]);

  const handleUnifyProducts = () => {
    if (compareSelected.length < 2) {
      toast.error('Selecione pelo menos 2 produtos para unificar.');
      return;
    }

    try {
      const newGroup = createProductGroup(compareSelected, favorites);

      // Atualiza os favoritos com os groupIds
      const updatedFavorites = loadFavorites();
      setFavorites(updatedFavorites);

      clearCompare();
      toast.success(`Produtos unificados com sucesso! Grupo: ${newGroup.name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao unificar produtos';
      toast.error(message);
    }
  };

  // Handlers do modal de gerenciamento de grupos
  const handleOpenGroupModal = (productId: string) => {
    setSelectedProductForGroup(productId);
    setIsGroupModalOpen(true);
  };

  const handleCloseGroupModal = () => {
    setIsGroupModalOpen(false);
    setSelectedProductForGroup(null);
  };

  const handleAddToGroup = (groupId: string, productId: string) => {
    try {
      addProductToGroup(groupId, productId, favorites);
      const updatedFavorites = loadFavorites();
      setFavorites(updatedFavorites);
      toast.success('Produto adicionado ao grupo com sucesso!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao adicionar produto ao grupo';
      toast.error(message);
    }
  };

  const handleRemoveFromGroup = (groupId: string, productId: string) => {
    try {
      removeProductFromGroup(groupId, productId, favorites);
      const updatedFavorites = loadFavorites();
      setFavorites(updatedFavorites);
      toast.success('Produto removido do grupo!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao remover produto do grupo';
      toast.error(message);
    }
  };

  const handleMoveToGroup = (fromGroupId: string, toGroupId: string, productId: string) => {
    try {
      // Remove do grupo atual
      removeProductFromGroup(fromGroupId, productId, favorites);
      // Adiciona ao novo grupo
      const updatedFavorites = loadFavorites();
      addProductToGroup(toGroupId, productId, updatedFavorites);
      setFavorites(loadFavorites());
      toast.success('Produto movido para outro grupo!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao mover produto';
      toast.error(message);
    }
  };

  const handleRenameGroup = (groupId: string, newName: string) => {
    try {
      updateGroupName(groupId, newName);
      toast.success('Grupo renomeado com sucesso!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao renomear grupo';
      toast.error(message);
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    try {
      deleteProductGroup(groupId, favorites);
      const updatedFavorites = loadFavorites();
      setFavorites(updatedFavorites);
      toast.success('Grupo excluído com sucesso!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir grupo';
      toast.error(message);
    }
  };

  /** Busca dados (KaBuM/Amazon), atualiza histórico e também name/image do favorito. */
  async function fetchAndUpsert(id: string, { silent = false }: { silent?: boolean } = {}) {
    try {
      const provider = detectProvider(id);

      // Usa cache compartilhado
      const result = await fetchProductWithCache(id, provider);

      const now = Date.now();
      const key = getHistoryKey(id);
      const prevRaw = localStorage.getItem(key);
      const prev = prevRaw ? (JSON.parse(prevRaw) as Snapshot[]) : [];

      const snap: Snapshot = {
        timestamp: now,
        priceVista: result.data.priceVista ?? null,
        priceParcelado: result.data.priceParcelado ?? null,
        priceOriginal: result.data.priceOriginal ?? null,
      };
      const next = upsertHistory(prev, snap);
      saveHistory(id, next);

      if (result.data?.name || result.data?.image) {
        setFavorites(curr => {
          const ix = curr.findIndex(f => f.id === id);
          if (ix === -1) return curr;
          const current = curr[ix];
          const updated: Favorite = {
            ...current,
            name: result.data.name ?? current.name,
            image: result.data.image ?? current.image,
          };
          if (updated.name === current.name && updated.image === current.image) return curr;
          const nextFavs = [...curr];
          nextFavs[ix] = updated;
          saveFavorites(nextFavs);
          return nextFavs;
        });
      }
    } catch (error) {
      if (!silent) {
        const message = error instanceof Error ? error.message : 'Falha ao atualizar um favorito.';
        toast.error(message);
      }
    }
  }

  /** Atualização individual (menu suspenso do card). */
  const refreshOneFavorite = async (id: string) => {
    setShimmeringIds(prev => [...new Set([...prev, id])]);
    try {
      await fetchAndUpsert(id);
      syncSnapshots([id]);
      toast.info('Favorito atualizado.');
    } catch (e) {
      console.error(e);
      toast.error('Não consegui atualizar este item agora.');
    } finally {
      setShimmeringIds(prev => prev.filter(x => x !== id));
    }
  };

  const refreshSelected = async () => {
    if (!compareSelected.length) return;
    setLoadingSelected(true);
    setShimmeringIds(compareSelected);
    try {
      for (const id of compareSelected) await fetchAndUpsert(id);
      syncSnapshots(compareSelected);
      toast.info(`Atualizados ${compareSelected.length} selecionados.`);
    } catch (e) {
      console.error(e);
      toast.error('Não consegui atualizar agora.');
    } finally {
      setLoadingSelected(false);
      setShimmeringIds([]);
    }
  };

  const refreshAllFavorites = async () => {
    if (!favorites.length) return;
    setLoadingAll(true);
    setShimmeringIds(favorites.map(f => f.id));
    try {
      for (const f of favorites) await fetchAndUpsert(f.id);
      syncSnapshots(favorites.map(f => f.id));
      toast.info('Todos os favoritos foram atualizados.');
    } catch (e) {
      console.error(e);
      toast.error('Não consegui atualizar todos agora.');
    } finally {
      setLoadingAll(false);
      setShimmeringIds([]);
    }
  };

  function syncSnapshots(ids: string[]) {
    setLatestById(prevMap => {
      const next = { ...prevMap };
      for (const id of ids) {
        try {
          const raw = localStorage.getItem(getHistoryKey(id));
          const arr = raw ? (JSON.parse(raw) as Snapshot[]) : [];
          next[id] = arr.at(-1);
        } catch {
          next[id] = undefined;
        }
      }
      return next;
    });
    setPrevById(prevMap => {
      const next = { ...prevMap };
      for (const id of ids) {
        try {
          const raw = localStorage.getItem(getHistoryKey(id));
          const arr = raw ? (JSON.parse(raw) as Snapshot[]) : [];
          next[id] = arr.length >= 2 ? arr[arr.length - 2] : undefined;
        } catch {
          next[id] = undefined;
        }
      }
      return next;
    });
  }

  const nameById: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {};
    favorites.forEach(f => { map[f.id] = f.name; });
    return map;
  }, [favorites]);

  const historyById: Record<string, Snapshot[]> = useMemo(() => {
    const map: Record<string, Snapshot[]> = {};
    compareSelected.forEach(id => {
      try {
        const raw = localStorage.getItem(getHistoryKey(id));
        map[id] = raw ? JSON.parse(raw) as Snapshot[] : [];
      } catch { map[id] = []; }
    });
    return map;
  }, [compareSelected]);

  const compareSeries = makeCompareSeries(compareSelected, nameById, historyById, compareMetric);

  const selectedProductName = useMemo(() => {
    if (!selectedProductForGroup) return '';
    const product = favorites.find(f => f.id === selectedProductForGroup);
    return product?.name || 'Produto';
  }, [selectedProductForGroup, favorites]);

  return (
    <main className="min-h-screen py-8">
      <div className="mx-auto w-full max-w-6xl px-6 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold">Favoritos & Comparação</h1>
          <p className="text-sm text-gray-600">
            Acompanhe seus produtos com atualização automática periódica.
            Histórico ilimitado para identificar tendências e o melhor momento para comprar.
          </p>
        </header>

        <section className="space-y-4">
          <FavoritesList
            favorites={favorites}
            onMonitor={(id) => router.push(`/?id=${id}`)}
            onRemove={deleteFavorite}
            latestById={latestById}
            prevById={prevById}
            onRefreshAll={refreshAllFavorites}
            onRefreshOne={refreshOneFavorite}
            loadingAll={loadingAll}
            compareSelected={compareSelected}
            onToggleCompare={toggleCompare}
            shimmeringIds={shimmeringIds}
            onManageGroup={handleOpenGroupModal}
            onRenameGroup={handleRenameGroup}
            onDeleteGroup={handleDeleteGroup}
          />

          <ComparePanel
            selected={compareSelected}
            nameById={nameById}
            metric={compareMetric}
            onMetric={setCompareMetric}
            onRemove={(id) => removeFromCompare(id)}
            onClear={() => clearCompare()}
            onCompare={() => {
              if (compareSelected.length < 2) return;
              const el = document.getElementById('compare-anchor');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            onRefreshSelected={refreshSelected}
            onUnifyProducts={handleUnifyProducts}
            disabled={loadingSelected || loadingAll}
            loading={loadingSelected || loadingAll}
          />
        </section>

        <div id="compare-anchor" />
        {compareSelected.length >= 2 && (
          <CompareChart series={compareSeries} />
        )}

        {/* Modal de gerenciamento de produtos */}
        <GroupManagementModal
          isOpen={isGroupModalOpen}
          productId={selectedProductForGroup}
          productName={selectedProductName}
          onClose={handleCloseGroupModal}
          onAddToGroup={handleAddToGroup}
          onRemoveFromGroup={handleRemoveFromGroup}
          onMoveToGroup={handleMoveToGroup}
        />
      </div>
    </main>
  );
}
