import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { getMonthlyStartingPriceFromProducts } from "@/lib/checkoutHelpers";

const SEMA_API =
  "https://panel.whitelabelmd.com/affordablewellness/api/get_all_sema";
const TIRZ_API =
  "https://panel.whitelabelmd.com/affordablewellness/api/get_all_tirz";

const isSemaglutideProduct = (p: { sku?: string; product_name?: string }) => {
  const sku = String(p?.sku || "").toLowerCase();
  const name = String(p?.product_name || "").toLowerCase();
  return (
    sku.includes("semaginj") ||
    name.includes("semaglutide") ||
    (name.includes("glp-1") && !name.includes("gip"))
  );
};

const isTirzepatideProduct = (p: { sku?: string; product_name?: string }) => {
  const sku = String(p?.sku || "").toLowerCase();
  const name = String(p?.product_name || "").toLowerCase();
  return (
    sku.includes("tirz") ||
    name.includes("tirzepatide") ||
    (name.includes("glp-1") && name.includes("gip")) ||
    name.includes("+ gip")
  );
};

export function useHomePageProducts() {
  const [semaglutideProducts, setSemaglutideProducts] = useState<any[]>([]);
  const [tirzepatideProducts, setTirzepatideProducts] = useState<any[]>([]);
  const [loadingSema, setLoadingSema] = useState(true);
  const [loadingTirz, setLoadingTirz] = useState(true);

  const fetchSemaglutideProducts = useCallback(async () => {
    setLoadingSema(true);
    try {
      const response = await axios.get(SEMA_API);
      if (response.data.status === 1) {
        const list = Array.isArray(response.data.data) ? response.data.data : [];
        setSemaglutideProducts(list.filter(isSemaglutideProduct));
      }
    } catch (error) {
      console.error("Error fetching semaglutide products:", error);
    } finally {
      setLoadingSema(false);
    }
  }, []);

  const fetchTirzepatideProducts = useCallback(async () => {
    setLoadingTirz(true);
    try {
      const response = await axios.get(TIRZ_API);
      if (response.data.status === 1) {
        const list = Array.isArray(response.data.data) ? response.data.data : [];
        setTirzepatideProducts(list.filter(isTirzepatideProduct));
      }
    } catch (error) {
      console.error("Error fetching tirzepatide products:", error);
    } finally {
      setLoadingTirz(false);
    }
  }, []);

  useEffect(() => {
    void fetchSemaglutideProducts();
    void fetchTirzepatideProducts();
  }, [fetchSemaglutideProducts, fetchTirzepatideProducts]);

  const semaglutideMonthly = getMonthlyStartingPriceFromProducts(semaglutideProducts);
  const tirzepatideMonthly = getMonthlyStartingPriceFromProducts(tirzepatideProducts);

  return {
    semaglutideProducts,
    tirzepatideProducts,
    loadingSema,
    loadingTirz,
    semaglutideMonthly,
    tirzepatideMonthly,
  };
}
