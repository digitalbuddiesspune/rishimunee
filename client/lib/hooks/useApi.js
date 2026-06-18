"use client";

import useSWR from "swr";
import { apiClient } from "../api-client.js";

const fetcher = async (url) => {
  const response = await apiClient.get(url);
  return response.data.data || response.data;
};

export const useApi = (url, options) => {
  const { data, error, isLoading, mutate } = useSWR(url, fetcher, options);
  return {
    data,
    error,
    isLoading,
    mutate
  };
};



