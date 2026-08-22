import React from "react";
import { CountryDropdownPicker, Select } from "../components/Select.jsx";
import { apiFetch } from "../lib/api.js";
import { countryOptions } from "../lib/constants.js";
import { useLanguage } from "../lib/i18n/language.jsx";
import { defaultKeitaroMapping, defaultKeitaroPayload, defaultKeitaroPayloadByTarget } from "../lib/keitaro-payloads.js";
import { motion } from "framer-motion";
import { Copy, Download, Link2, Megaphone, Plug, Trash2 } from "lucide-react";

export default function KeitaroApiView() {
  const { t } = useLanguage();
  const storageKey = "keitaro-config-v1";
  const stored = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch (error) {
      return {};
    }
  }, []);
  const initialSyncTarget = stored.syncTarget || "overall";

  const [baseUrl, setBaseUrl] = React.useState(stored.baseUrl || "");
  const [apiKey, setApiKey] = React.useState(stored.rememberKey ? stored.apiKey || "" : "");
  const [reportPath, setReportPath] = React.useState(stored.reportPath || "/admin_api/v1/report/build");
  const [payloadText, setPayloadText] = React.useState(
    stored.payloadText || defaultKeitaroPayloadByTarget[initialSyncTarget] || defaultKeitaroPayload
  );
  const [mapping, setMapping] = React.useState({ ...defaultKeitaroMapping, ...(stored.mapping || {}) });
  const [syncTarget, setSyncTarget] = React.useState(initialSyncTarget);
  const [replaceExisting, setReplaceExisting] = React.useState(
    stored.replaceExisting === undefined ? true : stored.replaceExisting
  );
  const [rememberKey, setRememberKey] = React.useState(Boolean(stored.rememberKey));
  const [testState, setTestState] = React.useState({ loading: false, ok: null, message: "" });
  const [syncState, setSyncState] = React.useState({ loading: false, ok: null, message: "" });
  const [syncResult, setSyncResult] = React.useState(null);
  const [formatCheck, setFormatCheck] = React.useState({ loading: false, error: "", data: null });
  // Mapping is a 26-input wall — keep it collapsed until explicitly opened.
  const [showMapping, setShowMapping] = React.useState(false);
  const [apiTab, setApiTab] = React.useState("connection"); // connection | postbacks | sync | campaigns
  const previousSyncTargetRef = React.useRef(initialSyncTarget);
  const [campaigns, setCampaigns] = React.useState([]);
  const [campaignState, setCampaignState] = React.useState({ loading: true, error: null });
  const [campaignForm, setCampaignForm] = React.useState({
    keitaroId: "",
    name: "",
    buyer: "",
    country: "",
    domain: "",
  });

  const postbackUrl = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/api/postbacks/install`;
  }, []);

  const postbackFtdUrl = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/api/postbacks/ftd`;
  }, []);

  const postbackRegistrationUrl = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/api/postbacks/registration`;
  }, []);

  const postbackRedepositUrl = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/api/postbacks/redeposit`;
  }, []);

  const postbackExample = postbackUrl
    ? `${postbackUrl}?external_id={pwauid}&country=BR&buyer=DeusInsta&domain=landing.example.com&device=Android`
    : "";

  const postbackFtdExample = postbackFtdUrl
    ? `${postbackFtdUrl}?country=BR&buyer=DeusInsta&domain=landing.example.com&device=Android`
    : "";

  const postbackRegistrationExample = postbackRegistrationUrl
    ? `${postbackRegistrationUrl}?country=BR&buyer=DeusInsta&domain=landing.example.com&device=Android`
    : "";

  const postbackRedepositExample = postbackRedepositUrl
    ? `${postbackRedepositUrl}?country=BR&buyer=DeusInsta&domain=landing.example.com&device=Android`
    : "";

  const postbackItems = [
    {
      key: "install",
      title: "Install Postback Receiver",
      subtitle: "Receive install events from your traffic source and attach them to Keitaro campaigns.",
      url: postbackUrl,
      example: postbackExample,
    },
    {
      key: "registration",
      title: "Registration Postback Receiver",
      subtitle:
        "Receive registration events from your traffic source and attach them to Keitaro campaigns.",
      url: postbackRegistrationUrl,
      example: postbackRegistrationExample,
    },
    {
      key: "ftd",
      title: "FTD Postback Receiver",
      subtitle: "Receive FTD events from your traffic source and attach them to Keitaro campaigns.",
      url: postbackFtdUrl,
      example: postbackFtdExample,
    },
    {
      key: "redeposit",
      title: "Redeposit Postback Receiver",
      subtitle:
        "Receive redeposit events from your traffic source and attach them to Keitaro campaigns.",
      url: postbackRedepositUrl,
      example: postbackRedepositExample,
    },
  ];

  React.useEffect(() => {
    const previousTarget = previousSyncTargetRef.current;
    if (previousTarget === syncTarget) return;
    const previousDefault = defaultKeitaroPayloadByTarget[previousTarget] || defaultKeitaroPayload;
    const nextDefault = defaultKeitaroPayloadByTarget[syncTarget] || defaultKeitaroPayload;
    const currentText = String(payloadText || "").trim();
    if (!currentText || currentText === String(previousDefault).trim()) {
      setPayloadText(nextDefault);
    }
    previousSyncTargetRef.current = syncTarget;
  }, [syncTarget, payloadText]);

  React.useEffect(() => {
    const payload = {
      baseUrl,
      reportPath,
      payloadText,
      mapping,
      syncTarget,
      replaceExisting,
      rememberKey,
    };
    if (rememberKey) {
      payload.apiKey = apiKey;
    }
    localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [baseUrl, reportPath, payloadText, mapping, syncTarget, replaceExisting, rememberKey, apiKey]);

  const handleMappingChange = (key) => (event) => {
    setMapping((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const ensurePayloadField = React.useCallback((payload, field) => {
    if (!payload || typeof payload !== "object" || !field) return payload;
    const normalizedField = String(field).trim();
    if (!normalizedField) return payload;

    const hasDimensions = Array.isArray(payload.dimensions);
    const hasGrouping = Array.isArray(payload.grouping);
    const normalized = normalizedField.toLowerCase();

    const appendField = (items) => {
      const nextItems = [...items];
      const exists = nextItems.some(
        (item) => String(item || "").trim().toLowerCase() === normalized
      );
      if (!exists) {
        nextItems.push(normalizedField);
      }
      return nextItems;
    };

    if (hasDimensions || hasGrouping) {
      const nextPayload = { ...payload };
      if (hasDimensions) {
        nextPayload.dimensions = appendField(payload.dimensions);
      }
      if (hasGrouping) {
        nextPayload.grouping = appendField(payload.grouping);
      }
      return nextPayload;
    }

    return { ...payload, dimensions: [normalizedField] };
  }, []);

  const ensurePayloadMeasure = React.useCallback((payload, measure) => {
    if (!payload || typeof payload !== "object" || !measure) return payload;
    const normalizedMeasure = String(measure).trim();
    if (!normalizedMeasure) return payload;
    const lower = normalizedMeasure.toLowerCase();
    const appendMeasure = (items) => {
      const nextItems = Array.isArray(items) ? [...items] : [];
      const exists = nextItems.some(
        (item) => String(item || "").trim().toLowerCase() === lower
      );
      if (!exists) {
        nextItems.push(normalizedMeasure);
      }
      return nextItems;
    };

    const nextPayload = { ...payload, measures: appendMeasure(payload.measures) };
    if (Array.isArray(payload.metrics)) {
      nextPayload.metrics = appendMeasure(payload.metrics);
    }
    return nextPayload;
  }, []);

  const fetchCampaigns = React.useCallback(async () => {
    try {
      setCampaignState({ loading: true, error: null });
      const response = await apiFetch("/api/campaigns?limit=200");
      if (!response.ok) {
        throw new Error("Failed to load campaigns.");
      }
      const data = await response.json();
      setCampaigns(data);
      setCampaignState({ loading: false, error: null });
    } catch (error) {
      setCampaignState({ loading: false, error: error.message || "Failed to load campaigns." });
    }
  }, []);

  React.useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const updateCampaignForm = (key) => (event) => {
    setCampaignForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const resetCampaignForm = () => {
    setCampaignForm({ keitaroId: "", name: "", buyer: "", country: "", domain: "" });
  };

  const handleCampaignSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await apiFetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaignForm),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save campaign.");
      }
      await fetchCampaigns();
      resetCampaignForm();
    } catch (error) {
      setCampaignState({ loading: false, error: error.message || "Failed to save campaign." });
    }
  };

  const handleCampaignDelete = async (id) => {
    try {
      const response = await apiFetch(`/api/campaigns/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete campaign.");
      }
      await fetchCampaigns();
    } catch (error) {
      setCampaignState({ loading: false, error: error.message || "Failed to delete campaign." });
    }
  };

  const handleCopyPostback = (value) => async () => {
    if (!value) return;
    try {
      await navigator.clipboard?.writeText(value);
    } catch (error) {
      // ignore clipboard failure
    }
  };

  const handleTest = async () => {
    setTestState({ loading: true, ok: null, message: "" });
    try {
      const response = await apiFetch("/api/keitaro/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseUrl, apiKey }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Connection failed.");
      }
      setTestState({ loading: false, ok: true, message: "Connection verified." });
    } catch (error) {
      setTestState({ loading: false, ok: false, message: error.message || "Connection failed." });
    }
  };

  const handleFormatCheck = async () => {
    setFormatCheck({ loading: true, error: "", data: null });
    try {
      const response = await apiFetch("/api/keitaro/campaign-format-check");
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Campaign check failed.");
      }
      setFormatCheck({ loading: false, error: "", data });
    } catch (error) {
      setFormatCheck({ loading: false, error: error.message || "Campaign check failed.", data: null });
    }
  };

  const handleSync = async () => {
    setSyncState({ loading: true, ok: null, message: "" });
    setSyncResult(null);
    let parsedPayload;
    try {
      parsedPayload = JSON.parse(payloadText);
    } catch (error) {
      setSyncState({ loading: false, ok: false, message: "Report payload must be valid JSON." });
      return;
    }

    const normalizeMeasures = (items) =>
      items.map((item) => {
        const key = String(item || "").trim().toLowerCase();
        if (key === "registrations" || key === "registration") return "regs";
        if (key === "ftd" || key === "ftds") return "custom_conversion_8";
        if (key === "redeposit" || key === "redeposits") return "custom_conversion_7";
        return item;
      });
    if (parsedPayload && typeof parsedPayload === "object") {
      if (Array.isArray(parsedPayload.measures)) {
        parsedPayload = { ...parsedPayload, measures: normalizeMeasures(parsedPayload.measures) };
      }
      if (Array.isArray(parsedPayload.metrics)) {
        parsedPayload = { ...parsedPayload, metrics: normalizeMeasures(parsedPayload.metrics) };
      }
    }

    if (syncTarget === "overall") {
      [
        mapping.dateField || defaultKeitaroMapping.dateField,
        mapping.buyerField || defaultKeitaroMapping.buyerField,
        mapping.countryField || defaultKeitaroMapping.countryField,
        mapping.cityField || defaultKeitaroMapping.cityField,
        mapping.regionField || defaultKeitaroMapping.regionField,
        mapping.placementField || defaultKeitaroMapping.placementField,
        mapping.domainField || defaultKeitaroMapping.domainField,
        mapping.campaignNameField || defaultKeitaroMapping.campaignNameField,
        mapping.adsetNameField || defaultKeitaroMapping.adsetNameField,
        mapping.adNameField || defaultKeitaroMapping.adNameField,
      ].forEach((field) => {
        parsedPayload = ensurePayloadField(parsedPayload, field);
      });
      [
        mapping.spendField || defaultKeitaroMapping.spendField,
        mapping.clicksField || defaultKeitaroMapping.clicksField,
        mapping.registersField || defaultKeitaroMapping.registersField,
        mapping.ftdsField || defaultKeitaroMapping.ftdsField,
        mapping.redepositsField || defaultKeitaroMapping.redepositsField,
        mapping.ftdRevenueField || defaultKeitaroMapping.ftdRevenueField,
        mapping.redepositRevenueField || defaultKeitaroMapping.redepositRevenueField,
      ].forEach((measure) => {
        parsedPayload = ensurePayloadMeasure(parsedPayload, measure);
      });
    } else if (syncTarget === "user_behavior") {
      [
        mapping.dateField || defaultKeitaroMapping.dateField,
        mapping.buyerField || defaultKeitaroMapping.buyerField,
        mapping.campaignField || defaultKeitaroMapping.campaignField,
        mapping.countryField || defaultKeitaroMapping.countryField,
        mapping.regionField || defaultKeitaroMapping.regionField,
        mapping.cityField || defaultKeitaroMapping.cityField,
        mapping.placementField || defaultKeitaroMapping.placementField,
        mapping.externalIdField || defaultKeitaroMapping.externalIdField,
      ].forEach((field) => {
        parsedPayload = ensurePayloadField(parsedPayload, field);
      });
      [
        mapping.clicksField || defaultKeitaroMapping.clicksField,
        mapping.registersField || defaultKeitaroMapping.registersField,
        mapping.ftdsField || defaultKeitaroMapping.ftdsField,
        mapping.redepositsField || defaultKeitaroMapping.redepositsField,
        mapping.ftdRevenueField || defaultKeitaroMapping.ftdRevenueField,
        mapping.redepositRevenueField || defaultKeitaroMapping.redepositRevenueField,
      ].forEach((measure) => {
        parsedPayload = ensurePayloadMeasure(parsedPayload, measure);
      });
    } else {
      [
        mapping.dateField || defaultKeitaroMapping.dateField,
        mapping.buyerField || defaultKeitaroMapping.buyerField,
        mapping.countryField || defaultKeitaroMapping.countryField,
        mapping.deviceField || defaultKeitaroMapping.deviceField,
        mapping.osField || defaultKeitaroMapping.osField,
        mapping.osVersionField || defaultKeitaroMapping.osVersionField,
        mapping.deviceModelField || defaultKeitaroMapping.deviceModelField,
      ].forEach((field) => {
        parsedPayload = ensurePayloadField(parsedPayload, field);
      });
      [
        mapping.spendField || defaultKeitaroMapping.spendField,
        mapping.revenueField || defaultKeitaroMapping.revenueField,
        mapping.clicksField || defaultKeitaroMapping.clicksField,
        mapping.registersField || defaultKeitaroMapping.registersField,
        mapping.ftdsField || defaultKeitaroMapping.ftdsField,
        mapping.redepositsField || defaultKeitaroMapping.redepositsField,
      ].forEach((measure) => {
        parsedPayload = ensurePayloadMeasure(parsedPayload, measure);
      });
    }

    try {
      let response = await apiFetch("/api/keitaro/sync?async=1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseUrl,
          apiKey,
          reportPath,
          payload: parsedPayload,
          mapping,
          replaceExisting,
          target: syncTarget,
          async: true,
        }),
      });
      if (response.status === 404 || response.status === 405) {
        response = await apiFetch("/api/keitaro/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            baseUrl,
            apiKey,
            reportPath,
            payload: parsedPayload,
            mapping,
            replaceExisting,
            target: syncTarget,
          }),
        });
      }
      if (response.status === 504 || response.status === 502) {
        throw new Error(
          "Gateway timeout. Backend is still running sync in foreground. Redeploy Render with the latest backend code."
        );
      }
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Sync failed.");
      }
      if (data?.async) {
        setSyncState({
          loading: false,
          ok: true,
          message: "Sync started. Refresh in a few minutes to see results.",
        });
        setSyncResult(null);
      } else {
        setSyncState({ loading: false, ok: true, message: "Sync complete." });
        setSyncResult(data);
        window.dispatchEvent(new Event("keitaro:sync"));
      }
    } catch (error) {
      setSyncState({ loading: false, ok: false, message: error.message || "Sync failed." });
    }
  };

  const [postbackLogs, setPostbackLogs] = React.useState([]);
  const [postbackLogState, setPostbackLogState] = React.useState({
    loading: false,
    error: null,
  });

  const fetchPostbackLogs = React.useCallback(async () => {
    try {
      setPostbackLogState({ loading: true, error: null });
      const response = await apiFetch("/api/postbacks/logs?limit=10");
      if (!response.ok) {
        throw new Error("Failed to load postback logs.");
      }
      const data = await response.json();
      setPostbackLogs(Array.isArray(data) ? data : []);
      setPostbackLogState({ loading: false, error: null });
    } catch (error) {
      setPostbackLogState({
        loading: false,
        error: error.message || "Failed to load postback logs.",
      });
    }
  }, []);

  React.useEffect(() => {
    fetchPostbackLogs();
  }, [fetchPostbackLogs]);

  const formatLogTime = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return String(value);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatEventLabel = (value) => {
    const label = String(value || "").toLowerCase();
    if (label === "ftd") return "FTD";
    if (label === "redeposit") return "Redeposit";
    if (label === "registration") return "Registration";
    if (label === "install") return "Install";
    return label || "—";
  };

  const visiblePostbackLogs = React.useMemo(
    () => postbackLogs.slice(0, 10),
    [postbackLogs]
  );

  const apiTabs = [
    { key: "connection", label: t("Connection"), icon: Plug },
    { key: "postbacks", label: t("Postbacks"), icon: Link2 },
    { key: "sync", label: t("Report Sync"), icon: Download },
    { key: "campaigns", label: t("Campaign Linker"), icon: Megaphone },
  ];

  return (
    <>
      <section className="panels panels-single offers-tabs-panel">
        <motion.div className="panel" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("Keitaro API")}</h2>
              <p className="panel-subtitle">
                {t("Connect the tracker, receive postbacks, sync reports, and link campaigns.")}
              </p>
            </div>
            <div className="offers-tabs">
              {apiTabs.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`offers-tab${apiTab === item.key ? " is-active" : ""}`}
                  onClick={() => setApiTab(item.key)}
                >
                  <item.icon size={14} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {apiTab === "connection" ? (
      <section className="panels api-stack">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="panel-head api-head">
            <div>
              <h2 className="panel-title">{t("Keitaro Connection")}</h2>
              <p className="panel-subtitle">{t("Connect your tracker and validate the Admin API key.")}</p>
            </div>
          </div>

          <div className="api-banner">
            <div>
              <strong>{t("Connection checklist")}</strong>
              <p>{t("Base URL, API key, and report endpoint are required before syncing.")}</p>
            </div>
          </div>

          <div className="form-grid api-grid">
            <div className="field">
              <label>{t("Base URL")}</label>
              <input
                type="text"
                placeholder="https://tracker.yourdomain.com"
                value={baseUrl}
                onChange={(event) => setBaseUrl(event.target.value)}
              />
            </div>
            <div className="field">
              <label>{t("API Key")}</label>
              <input
                type="password"
                placeholder="Keitaro API key"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
              />
            </div>
            <div className="field">
              <label>{t("Report Endpoint")}</label>
              <input
                type="text"
                value={reportPath}
                onChange={(event) => setReportPath(event.target.value)}
              />
              <p className="field-hint">{t("Default Keitaro report endpoint.")}</p>
            </div>
            <div className="field field-inline">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={rememberKey}
                  onChange={(event) => setRememberKey(event.target.checked)}
                />
                {t("Remember API key locally")}
              </label>
              <p className="field-hint">{t("Stored only in your browser.")}</p>
            </div>
          </div>

          <div className="api-actions">
            {testState.message && (
              <div className={`api-status ${testState.ok ? "success" : "error"}`}>
                {testState.message}
              </div>
            )}
            <button
              className="ghost"
              type="button"
              onClick={handleFormatCheck}
              disabled={formatCheck.loading}
            >
              {formatCheck.loading ? t("Checking...") : t("Check Campaign Naming")}
            </button>
            <button className="ghost" type="button" onClick={handleTest} disabled={testState.loading}>
              {testState.loading ? t("Testing...") : t("Test Connection")}
            </button>
          </div>

          {(formatCheck.error || formatCheck.data) && (
            <div className="format-check">
              {formatCheck.error ? (
                <div className="api-status error">{formatCheck.error}</div>
              ) : (
                <>
                  <div className="format-check-summary">
                    <span className="format-check-stat">
                      <strong>{formatCheck.data.total}</strong> {t("campaigns")}
                    </span>
                    <span className="format-check-stat ok">
                      <strong>{formatCheck.data.formatted}</strong> {t("formatted")}
                    </span>
                    <span
                      className={`format-check-stat ${formatCheck.data.unformattedCount ? "warn" : "ok"}`}
                    >
                      <strong>{formatCheck.data.unformattedCount}</strong> {t("off-format")}
                    </span>
                  </div>
                  {formatCheck.data.unformattedCount === 0 ? (
                    <div className="api-status success">
                      {t("All campaigns follow Buyer | Tool | Game | Geo | Brand.")}
                    </div>
                  ) : (
                    <div className="table-wrap">
                      <table className="entries-table">
                        <thead>
                          <tr>
                            <th>{t("Campaign")}</th>
                            <th>{t("Segments")}</th>
                            <th>{t("Issues")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formatCheck.data.unformatted.map((c) => (
                            <tr key={c.id ?? c.name}>
                              <td>{c.name}</td>
                              <td>{c.segmentCount}/5</td>
                              <td>{c.issues.join("; ")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {formatCheck.data.buyers?.length ? (
                    <p className="panel-subtitle">
                      {t("Buyers detected")}: {formatCheck.data.buyers.join(", ")}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          )}
        </motion.div>
      </section>
      ) : null}

      {apiTab === "postbacks" ? (
      <section className="panels api-stack">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="panel-head api-head">
            <div>
              <h2 className="panel-title">{t("Postback Receivers")}</h2>
              <p className="panel-subtitle">
                {t("Use these endpoints to attach events to Keitaro campaigns.")}
              </p>
            </div>
          </div>

          <div className="postback-info">
            <div>
              <span className="panel-mini">{t("Required parameters")}</span>
              <p>{t("Provide buyer and domain (or campaign_id) for attribution.")}</p>
            </div>
            <div>
              <span className="panel-mini">{t("Optional parameters")}</span>
              <p>{t("external_id, country, buyer, domain, device, status, payout.")}</p>
            </div>
          </div>

          <div className="postback-grid">
            {postbackItems.map((item) => (
              <div className="postback-card" key={item.key}>
                <div className="postback-card-head">
                  <div className="panel-title">{t(item.title)}</div>
                  <div className="panel-subtitle">{t(item.subtitle)}</div>
                </div>
                <div className="postback-url">
                  <input className="code-input" value={item.url} readOnly />
                  <button className="ghost" type="button" onClick={handleCopyPostback(item.url)}>
                    <Copy size={14} />
                    {t("Copy URL")}
                  </button>
                </div>
                {item.example ? (
                  <details className="postback-example-toggle">
                    <summary>{t("Example request")}</summary>
                    <code className="postback-example">{item.example}</code>
                  </details>
                ) : null}
              </div>
            ))}
          </div>

          <div className="api-section postback-logs">
            <div className="api-section-head">
              <div>
                <h4 className="panel-title">{t("Postback Logs")}</h4>
                <p className="panel-subtitle">{t("Latest events received from postbacks.")}</p>
              </div>
              <button
                className="ghost"
                type="button"
                onClick={fetchPostbackLogs}
                disabled={postbackLogState.loading}
              >
                {postbackLogState.loading ? t("Refreshing...") : t("Refresh")}
              </button>
            </div>

            {postbackLogState.error ? (
              <div className="api-status error">{postbackLogState.error}</div>
            ) : postbackLogs.length === 0 ? (
              <div className="empty-state">{t("No postback logs yet.")}</div>
            ) : (
              <div>
                <div className="table-wrap">
                  <table className="entries-table postback-table">
                    <thead>
                      <tr>
                        <th>{t("Time")}</th>
                        <th>{t("Event")}</th>
                        <th>{t("Media Buyer")}</th>
                        <th>{t("Domain")}</th>
                        <th>{t("Country")}</th>
                        <th>{t("External ID")}</th>
                        <th>{t("Source")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visiblePostbackLogs.map((row) => (
                        <tr key={row.id}>
                          <td>{formatLogTime(row.created_at || row.date)}</td>
                          <td>
                            <span className={`postback-event ${String(row.event_type || "").toLowerCase()}`}>
                              {formatEventLabel(row.event_type)}
                            </span>
                          </td>
                          <td>{row.buyer || "—"}</td>
                          <td>{row.domain || "—"}</td>
                          <td>{row.country || "—"}</td>
                          <td className="mono">{row.external_id || "—"}</td>
                          <td>{row.source || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </section>
      ) : null}

      {apiTab === "sync" ? (
      <section className="panels api-stack">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="panel-head api-head">
            <div>
              <h2 className="panel-title">{t("Report Sync")}</h2>
              <p className="panel-subtitle">
                {t("Paste a Keitaro report payload and map fields into your statistics table.")}
              </p>
            </div>
          </div>

          <div className="api-subgrid">
            <div className="field">
              <label>{t("Sync Target")}</label>
              <Select
                value={syncTarget}
                onChange={(v) => setSyncTarget(v)}
                options={[
                  { value: "overall", label: t("Overall Stats") },
                  { value: "device", label: t("Device Stats") },
                  { value: "user_behavior", label: t("User Behavior") },
                ]}
                placeholder={t("Select")}
              />
              <p className="field-hint">{t("Choose where the report data should be stored.")}</p>
            </div>
            <div className="field field-inline">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={replaceExisting}
                  onChange={(event) => setReplaceExisting(event.target.checked)}
                />
                {t("Replace existing entries for the same date + buyer + country")}
              </label>
            </div>
          </div>

          <div className="field">
            <label>{t("Report Payload (JSON)")}</label>
            <textarea
              className="code-input"
              value={payloadText}
              onChange={(event) => setPayloadText(event.target.value)}
            />
            <p className="field-hint">
              {t(
                "Tip: open a Keitaro report, copy the request payload from your browser network tab, and paste it here."
              )}
            </p>
          </div>

          <div className="api-section">
            <div className="api-section-head">
              <div>
                <h4 className="panel-mini">{t("Field Mapping")}</h4>
                <p className="panel-subtitle">
                  {t("Map Keitaro fields to dashboard columns.")}
                </p>
              </div>
              <button className="ghost" type="button" onClick={() => setShowMapping((prev) => !prev)}>
                {showMapping ? t("Hide Mapping") : t("Show Mapping")}
              </button>
            </div>
            {showMapping ? (
              <div className="mapping-grid">
                <div className="mapping-group">
                  <h5>{t("Identity Fields")}</h5>
                  <div className="mapping-fields">
                    <div className="field">
                      <label>{t("Date Field")}</label>
                      <input value={mapping.dateField} onChange={handleMappingChange("dateField")} />
                    </div>
                    <div className="field">
                      <label>{t("Buyer Field")}</label>
                      <input value={mapping.buyerField} onChange={handleMappingChange("buyerField")} />
                    </div>
                    <div className="field">
                      <label>{t("Campaign Field")}</label>
                      <input
                        value={mapping.campaignField || ""}
                        onChange={handleMappingChange("campaignField")}
                      />
                    </div>
                    <div className="field">
                      <label>{t("External ID Field")}</label>
                      <input
                        value={mapping.externalIdField || ""}
                        onChange={handleMappingChange("externalIdField")}
                      />
                    </div>
                  </div>
                </div>
                <div className="mapping-group">
                  <h5>{t("Geo Fields")}</h5>
                  <div className="mapping-fields">
                    <div className="field">
                      <label>{t("Country Field")}</label>
                      <input value={mapping.countryField} onChange={handleMappingChange("countryField")} />
                    </div>
                    <div className="field">
                      <label>{t("Region Field")}</label>
                      <input value={mapping.regionField || ""} onChange={handleMappingChange("regionField")} />
                    </div>
                    <div className="field">
                      <label>{t("City Field")}</label>
                      <input value={mapping.cityField || ""} onChange={handleMappingChange("cityField")} />
                    </div>
                    <div className="field">
                      <label>{t("Placement Field")}</label>
                      <input
                        value={mapping.placementField || ""}
                        onChange={handleMappingChange("placementField")}
                      />
                    </div>
                    <div className="field">
                      <label>{t("Domain Field")}</label>
                      <input
                        value={mapping.domainField || ""}
                        onChange={handleMappingChange("domainField")}
                      />
                    </div>
                  </div>
                </div>
                <div className="mapping-group">
                  <h5>{t("Campaign Fields")}</h5>
                  <div className="mapping-fields">
                    <div className="field">
                      <label>{t("Campaign Name Field")}</label>
                      <input
                        value={mapping.campaignNameField || ""}
                        onChange={handleMappingChange("campaignNameField")}
                      />
                    </div>
                    <div className="field">
                      <label>{t("Adset Name Field")}</label>
                      <input
                        value={mapping.adsetNameField || ""}
                        onChange={handleMappingChange("adsetNameField")}
                      />
                    </div>
                    <div className="field">
                      <label>{t("Ad Name Field")}</label>
                      <input
                        value={mapping.adNameField || ""}
                        onChange={handleMappingChange("adNameField")}
                      />
                    </div>
                  </div>
                </div>
                <div className="mapping-group">
                  <h5>{t("Performance Fields")}</h5>
                  <div className="mapping-fields">
                    <div className="field">
                      <label>{t("Spend Field")}</label>
                      <input value={mapping.spendField} onChange={handleMappingChange("spendField")} />
                    </div>
                    <div className="field">
                      <label>{t("Revenue Field")}</label>
                      <input value={mapping.revenueField} onChange={handleMappingChange("revenueField")} />
                    </div>
                    <div className="field">
                      <label>{t("FTD Revenue Field")}</label>
                      <input
                        value={mapping.ftdRevenueField || ""}
                        onChange={handleMappingChange("ftdRevenueField")}
                      />
                    </div>
                    <div className="field">
                      <label>{t("Redeposit Revenue Field")}</label>
                      <input
                        value={mapping.redepositRevenueField || ""}
                        onChange={handleMappingChange("redepositRevenueField")}
                      />
                    </div>
                  </div>
                </div>
                <div className="mapping-group">
                  <h5>{t("Event Fields")}</h5>
                  <div className="mapping-fields">
                    <div className="field">
                      <label>{t("Clicks Field")}</label>
                      <input value={mapping.clicksField} onChange={handleMappingChange("clicksField")} />
                    </div>
                    <div className="field">
                      <label>{t("Installs Field")}</label>
                      <input value={mapping.installsField} onChange={handleMappingChange("installsField")} />
                    </div>
                    <div className="field">
                      <label>{t("Registers Field")}</label>
                      <input value={mapping.registersField} onChange={handleMappingChange("registersField")} />
                    </div>
                    <div className="field">
                      <label>{t("FTDs Field")}</label>
                      <input value={mapping.ftdsField} onChange={handleMappingChange("ftdsField")} />
                    </div>
                    <div className="field">
                      <label>{t("Redeposits Field")}</label>
                      <input value={mapping.redepositsField} onChange={handleMappingChange("redepositsField")} />
                    </div>
                  </div>
                </div>
                <div className="mapping-group">
                  <h5>{t("Device Fields")}</h5>
                  <div className="mapping-fields">
                    <div className="field">
                      <label>{t("Device Field")}</label>
                      <input value={mapping.deviceField} onChange={handleMappingChange("deviceField")} />
                    </div>
                    <div className="field">
                      <label>{t("OS Field")}</label>
                      <input value={mapping.osField || ""} onChange={handleMappingChange("osField")} />
                    </div>
                    <div className="field">
                      <label>{t("OS Version Field")}</label>
                      <input
                        value={mapping.osVersionField || ""}
                        onChange={handleMappingChange("osVersionField")}
                      />
                    </div>
                    <div className="field">
                      <label>{t("OS Icon Field")}</label>
                      <input value={mapping.osIconField || ""} onChange={handleMappingChange("osIconField")} />
                    </div>
                    <div className="field">
                      <label>{t("Device Model Field")}</label>
                      <input
                        value={mapping.deviceModelField || ""}
                        onChange={handleMappingChange("deviceModelField")}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="field-hint">{t("Mapping hidden. Click show to edit fields.")}</p>
            )}
          </div>

          <div className="api-actions">
            {syncState.message && (
              <div className={`api-status ${syncState.ok ? "success" : "error"}`}>
                {syncState.message}
                {syncResult?.inserted !== undefined && (
                  <span className="api-status-meta">
                    {t("Imported {inserted} rows, skipped {skipped} of {total}", {
                      inserted: syncResult.inserted,
                      skipped: syncResult.skipped,
                      total: syncResult.total,
                    })}
                    {syncResult.placementsExtracted !== undefined
                      ? ` · ${t("Placements extracted")}: ${syncResult.placementsExtracted}`
                      : ""}
                    {Array.isArray(syncResult.placementSamples) && syncResult.placementSamples.length
                      ? ` · ${t("Samples")}: ${syncResult.placementSamples.join(", ")}`
                      : ""}
                  </span>
                )}
              </div>
            )}
            <div className="api-actions-group">
              <button
                className="ghost"
                type="button"
                onClick={() => setPayloadText(defaultKeitaroPayloadByTarget[syncTarget] || defaultKeitaroPayload)}
              >
                {t("Load Example Payload")}
              </button>
            </div>
            <button className="action-pill" type="button" onClick={handleSync} disabled={syncState.loading}>
              {syncState.loading ? t("Syncing...") : t("Sync Now")}
            </button>
          </div>
        </motion.div>
      </section>
      ) : null}

      {apiTab === "campaigns" ? (
      <section className="panels api-stack">
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("Campaign Mapping")}</h2>
              <p className="panel-subtitle">
                {t("Map Keitaro campaign IDs to media buyers for install attribution.")}
              </p>
            </div>
          </div>

          <form className="form-grid api-grid" onSubmit={handleCampaignSubmit}>
            <div className="field">
              <label>{t("Keitaro Campaign ID")}</label>
              <input value={campaignForm.keitaroId} onChange={updateCampaignForm("keitaroId")} />
            </div>
            <div className="field">
              <label>{t("Campaign Name")}</label>
              <input value={campaignForm.name} onChange={updateCampaignForm("name")} required />
            </div>
            <div className="field">
              <label>{t("Media Buyer")}</label>
              <input value={campaignForm.buyer} onChange={updateCampaignForm("buyer")} required />
            </div>
            <div className="field">
              <label>{t("Country")}</label>
              <CountryDropdownPicker
                value={campaignForm.country}
                onChange={(country) => setCampaignForm((prev) => ({ ...prev, country }))}
                options={countryOptions}
                placeholder={t("All Countries")}
                allOption={{ value: "", label: t("All Countries") }}
                searchPlaceholder={t("Type to find countries")}
                emptyResultsLabel={t("No countries found.")}
              />
            </div>
            <div className="field">
              <label>{t("Domain")}</label>
              <input
                value={campaignForm.domain}
                onChange={updateCampaignForm("domain")}
                placeholder="landing.example.com"
              />
            </div>
            <div className="form-actions">
              <button className="action-pill" type="submit">
                {t("Add Campaign")}
              </button>
            </div>
          </form>

          {campaignState.loading ? (
            <div className="empty-state">{t("Loading campaigns…")}</div>
          ) : campaignState.error ? (
            <div className="empty-state error">{campaignState.error}</div>
          ) : campaigns.length === 0 ? (
            <div className="empty-state">{t("No campaigns added yet.")}</div>
          ) : (
            <div className="table-wrap">
              <table className="entries-table campaign-table">
                <thead>
                  <tr>
                    <th>{t("Campaign Name")}</th>
                    <th>{t("Keitaro Campaign ID")}</th>
                    <th>{t("Media Buyer")}</th>
                    <th>{t("Country")}</th>
                    <th>{t("Domain")}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td>{campaign.name}</td>
                      <td>{campaign.keitaro_id || "—"}</td>
                      <td>{campaign.buyer}</td>
                      <td>{campaign.country || "—"}</td>
                      <td>{campaign.domain || "—"}</td>
                      <td>
                        <button
                          className="icon-btn"
                          type="button"
                          onClick={() => handleCampaignDelete(campaign.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </section>
      ) : null}
    </>
  );
}
