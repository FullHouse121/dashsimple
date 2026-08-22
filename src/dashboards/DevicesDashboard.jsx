import React from "react";
import { DeviceMix, OS_METRICS, OsComparison, OsVersions, WasteCallout, findWaste } from "../components/DeviceInsights.jsx";
import { PAGE_SIZE, Pager, usePagination } from "../components/Pager.jsx";
import { PeriodSelect } from "../components/PeriodSelect.jsx";
import { apiFetch } from "../lib/api.js";
import { getPeriodDateRange, isDateInRange, normalizeDateRange } from "../lib/date.js";
import { matchesBuyerFilter, matchesCountryFilter } from "../lib/filters.js";
import { formatCurrency } from "../lib/format.js";
import { useLanguage } from "../lib/i18n/language.jsx";
import { DURATION, EASE, stagger } from "../lib/motion.js";
import { goToView } from "../lib/navigation.js";
import { getOsAccent, getOsIconComponent } from "../lib/os-icons.jsx";
import { isLeadershipRole } from "../lib/permissions.js";
import { motion } from "framer-motion";
import { AlertTriangle, Download, Target, Wallet } from "lucide-react";

export default function DevicesDashboard({ period, setPeriod, customRange, onCustomChange, filters, authUser, viewerBuyer }) {
  const { t } = useLanguage();
  const isLeadership = isLeadershipRole(authUser?.role);
  const effectiveBuyer = viewerBuyer || authUser?.username || "";
  const [deviceEntries, setDeviceEntries] = React.useState([]);
  const [deviceState, setDeviceState] = React.useState({ loading: true, error: null });
  const periodRange = React.useMemo(
    () => getPeriodDateRange(period, customRange),
    [period, customRange.from, customRange.to]
  );
  const globalDateRange = React.useMemo(
    () => normalizeDateRange(filters?.dateFrom, filters?.dateTo),
    [filters?.dateFrom, filters?.dateTo]
  );
  const effectiveDateRange =
    globalDateRange.from || globalDateRange.to ? globalDateRange : periodRange;
  const globalBuyerFilter = filters?.buyer || "All";
  const globalCountryFilter = filters?.country || "All";

  const fetchDeviceStats = React.useCallback(async () => {
    try {
      setDeviceState({ loading: true, error: null });
      // Ask for the selected window, not "the newest 500 rows": device_stats
      // is per day x device x os x version x model, so a month easily exceeds
      // any small cap and the page silently under-reported every total.
      const periodRange = getPeriodDateRange(period, customRange);
      const globalRange = normalizeDateRange(filters?.dateFrom, filters?.dateTo);
      const range = globalRange.from || globalRange.to ? globalRange : periodRange;
      const params = new URLSearchParams({ limit: "50000" });
      if (range.from) params.set("from", range.from);
      if (range.to) params.set("to", range.to);
      const response = await apiFetch(`/api/device-stats?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load device stats.");
      }
      const data = await response.json();
      setDeviceEntries(data);
      setDeviceState({ loading: false, error: null });
    } catch (error) {
      setDeviceState({ loading: false, error: error.message || "Failed to load device stats." });
    }
    // The request now carries the window, so it has to re-run when the window
    // moves — with an empty dep list it fetched once and never again.
  }, [period, customRange.from, customRange.to, filters?.dateFrom, filters?.dateTo]);

  React.useEffect(() => {
    fetchDeviceStats();
  }, [fetchDeviceStats]);

  React.useEffect(() => {
    const handleSync = () => {
      fetchDeviceStats();
    };
    window.addEventListener("keitaro:sync", handleSync);
    return () => window.removeEventListener("keitaro:sync", handleSync);
  }, [fetchDeviceStats]);

  const filteredDeviceEntries = React.useMemo(
    () =>
      deviceEntries.filter((row) => {
        if (!isDateInRange(row.date, effectiveDateRange)) return false;
        if (!matchesBuyerFilter(row.buyer, globalBuyerFilter, effectiveBuyer, isLeadership)) {
          return false;
        }
        if (!matchesCountryFilter(row.country, globalCountryFilter)) return false;
        return true;
      }),
    [
      deviceEntries,
      effectiveDateRange.from,
      effectiveDateRange.to,
      globalBuyerFilter,
      globalCountryFilter,
      effectiveBuyer,
      isLeadership,
    ]
  );

  const sum = (value) => Number(value || 0);
  const deviceMap = new Map();

  const getDeviceKey = (row) => {
    const device = row.device || "Unknown";
    const os = row.os || row.os_version || row.osVersion || "";
    const osVersion = row.os_version || row.osVersion || "";
    const deviceModel = row.device_model || row.deviceModel || "";
    return `${device}||${os}||${osVersion}||${deviceModel}`;
  };

  filteredDeviceEntries.forEach((row) => {
    const device = row.device || "Unknown";
    const os = row.os || row.os_version || row.osVersion || "";
    const osVersion = row.os_version || row.osVersion || "";
    const osIcon = row.os_icon || row.osIcon || "";
    const deviceModel = row.device_model || row.deviceModel || "";
    const key = getDeviceKey(row);
    if (!deviceMap.has(key)) {
      deviceMap.set(key, {
        key,
        device,
        os,
        osVersion,
        osIcon,
        deviceModel,
        label: [device, os, osVersion, deviceModel].filter(Boolean).join(" · "),
        clicks: 0,
        installs: 0,
        registers: 0,
        ftds: 0,
        spend: 0,
        revenue: 0,
      });
    }
    const current = deviceMap.get(key);
    current.clicks += sum(row.clicks);
    current.installs += sum(row.installs);
    current.registers += sum(row.registers);
    current.ftds += sum(row.ftds);
    current.spend += sum(row.spend);
    current.revenue += sum(row.revenue);
  });

  const deviceData = Array.from(deviceMap.values()).sort((a, b) => b.revenue - a.revenue);

  const osMap = new Map();
  deviceData.forEach((row) => {
    const osName = row.os || row.device || "Unknown";
    const key = osName.toLowerCase();
    if (!osMap.has(key)) {
      osMap.set(key, { key, name: osName, revenue: 0, clicks: 0, installs: 0, ftds: 0, registers: 0 });
    }
    const current = osMap.get(key);
    current.revenue += row.revenue || 0;
    current.clicks += row.clicks || 0;
    current.installs += row.installs || 0;
    current.ftds += row.ftds || 0;
    current.registers += row.registers || 0;
  });
  const osData = Array.from(osMap.values()).sort((a, b) => b.revenue - a.revenue);
  const topOs = osData[0] || null;

  const osVersionMap = new Map();
  deviceData.forEach((row) => {
    const osName = row.os || row.device || "Unknown";
    const version = row.osVersion || "Unknown";
    const key = `${osName}||${version}`;
    const label = version && version !== "Unknown" ? `${osName} ${version}`.trim() : osName;
    if (!osVersionMap.has(key)) {
      osVersionMap.set(key, { key, label, os: osName, version, revenue: 0, clicks: 0, installs: 0, ftds: 0 });
    }
    const current = osVersionMap.get(key);
    current.revenue += row.revenue || 0;
    current.clicks += row.clicks || 0;
    current.installs += row.installs || 0;
    current.ftds += row.ftds || 0;
  });
  const osVersionData = Array.from(osVersionMap.values()).sort((a, b) => b.revenue - a.revenue);
  const topOsVersion = osVersionData[0] || null;
  const topOsVersionCr =
    topOsVersion && topOsVersion.clicks
      ? (topOsVersion.ftds / topOsVersion.clicks) * 100
      : 0;

  const deviceChartData = deviceData.map((row) => ({
    key: row.key,
    device: row.label || row.device,
    deviceRaw: row.device,
    deviceModel: row.deviceModel,
    osIcon: row.osIcon,
    os: row.os,
    osVersion: row.osVersion,
    revenue: row.revenue,
    clicks: row.clicks,
    installs: row.installs,
    cr: row.clicks ? (row.ftds / row.clicks) * 100 : 0,
  }));

  // `name`, plus the derived measures OsComparison ranks and labels by.
  const osChartData = osData.map((row) => ({
    key: row.key,
    name: row.name,
    os: row.name,
    revenue: row.revenue,
    clicks: row.clicks,
    registers: row.registers || 0,
    ftds: row.ftds || 0,
    installs: row.installs,
    epc: row.clicks ? row.revenue / row.clicks : 0,
    cr: row.clicks ? (row.ftds / row.clicks) * 100 : 0,
  }));

  const valueDomain = (data, key) => [
    0,
    (dataMax) => {
      const maxValue = Math.max(dataMax || 0, ...data.map((item) => item[key] || 0));
      return maxValue > 0 ? Math.ceil(maxValue * 1.15) : 10;
    },
  ];

  const TopOsIcon = getOsIconComponent(topOs?.name);
  const topOsAccent = getOsAccent(topOs?.name);

  // Platform families (Mobile / Desktop / Tablet …) rather than OS names: the
  // first question is which kind of device, the second is which OS.
  const platformData = React.useMemo(() => {
    const map = new Map();
    deviceData.forEach((row) => {
      const name = row.device || "Unknown";
      if (!map.has(name)) {
        map.set(name, { name, clicks: 0, registers: 0, ftds: 0, revenue: 0, spend: 0 });
      }
      const cur = map.get(name);
      cur.clicks += row.clicks || 0;
      cur.registers += row.registers || 0;
      cur.ftds += row.ftds || 0;
      cur.revenue += row.revenue || 0;
      cur.spend += row.spend || 0;
    });
    return [...map.values()].sort((a, b) => b.clicks - a.clicks);
  }, [deviceData]);

  const deviceTotals = React.useMemo(
    () =>
      deviceData.reduce(
        (acc, row) => ({
          clicks: acc.clicks + (row.clicks || 0),
          registers: acc.registers + (row.registers || 0),
          ftds: acc.ftds + (row.ftds || 0),
          revenue: acc.revenue + (row.revenue || 0),
          spend: acc.spend + (row.spend || 0),
        }),
        { clicks: 0, registers: 0, ftds: 0, revenue: 0, spend: 0 }
      ),
    [deviceData]
  );

  const mobileClicks = platformData
    .filter((row) => /mobile|phone/i.test(row.name))
    .reduce((acc, row) => acc + row.clicks, 0);
  const mobileShare = deviceTotals.clicks > 0 ? (mobileClicks / deviceTotals.clicks) * 100 : 0;
  const nonMobileClicks = deviceTotals.clicks - mobileClicks;

  // Waste is measured across platforms and OSes both, since either can be the
  // level at which a segment is worth excluding.
  const wasteRows = React.useMemo(() => findWaste([...platformData, ...osData]), [platformData, osData]);
  const wastedClicks = wasteRows.reduce((acc, row) => acc + (row.clicks || 0), 0);
  const wasteLeaders = wasteRows.slice(0, 2).map((row) => row.name).join(", ");
  const [osMetric, setOsMetric] = React.useState("clicks");
  // 2,282 rows across 378 device models rendered in one table before this,
  // which buried the charts and made the page feel broken.
  const devicePagination = usePagination(deviceChartData.length, PAGE_SIZE);
  const pagedDeviceRows = React.useMemo(
    () => deviceChartData.slice(devicePagination.from, devicePagination.to),
    [deviceChartData, devicePagination.from, devicePagination.to]
  );
  const maxDeviceClicks = Math.max(0, ...deviceChartData.map((row) => row.clicks || 0));

  return (
    <>
      <section className="cards">
        {[
          // Measures first. The old set headlined "Android" and "Android 10"
          // twice over and a hard-coded 0 for installs, which said nothing
          // about how the account is doing.
          {
            label: "Clicks",
            value: deviceTotals.clicks.toLocaleString(),
            iconNode: <TopOsIcon size={18} style={{ color: topOsAccent }} />,
            meta: `${deviceTotals.registers.toLocaleString()} ${t("registers")} · ${deviceTotals.ftds.toLocaleString()} ${t("FTDs")}`,
          },
          {
            label: "Revenue",
            value: formatCurrency(deviceTotals.revenue),
            icon: Wallet,
            meta:
              deviceTotals.spend > 0
                ? `${formatCurrency(deviceTotals.spend)} ${t("spend")} · ${(deviceTotals.revenue / deviceTotals.spend).toFixed(2)}x ROAS`
                : t("No spend recorded"),
          },
          {
            label: "Mobile Share",
            value: `${mobileShare.toFixed(0)}%`,
            icon: Target,
            meta: `${t("of clicks")} · ${nonMobileClicks.toLocaleString()} ${t("elsewhere")}`,
          },
          {
            label: "Wasted Clicks",
            // The number worth acting on: volume that returned nothing.
            value: wastedClicks.toLocaleString(),
            icon: Download,
            meta: wastedClicks
              ? `${t("no revenue")} · ${wasteLeaders}`
              : t("every segment earned"),
          },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stagger(idx), duration: DURATION.settle, ease: EASE }}
            >
              <div className="card-head">
                {stat.iconNode || (Icon ? <Icon size={18} /> : null)}
                {t(stat.label)}
              </div>
              <div className={`card-value${stat.untrusted ? " is-untrusted" : ""}`}>{stat.value}</div>
              {stat.untrusted ? (
                <button
                  type="button"
                  className="card-untrusted"
                  onClick={() => goToView("health")}
                  title={t("Spend is missing for some ad accounts, so this figure is computed from incomplete cost. Open Health to see why.")}
                >
                  <AlertTriangle size={11} /> {stat.untrustedLabel || t("cost data incomplete")}
                </button>
              ) : null}
              {stat.meta ? <div className="card-meta">{t(stat.meta)}</div> : null}
            </motion.div>
          );
        })}
      </section>

      <section className="panels device-charts device-panels">
        <motion.div
          className="panel span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.settle, ease: EASE }}
        >
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("Platform Mix")}</h2>
              <p className="panel-subtitle">
                {t("Share of clicks against share of revenue. A platform that takes traffic and returns none is an exclusion waiting to be made.")}
              </p>
            </div>
            <div className="panel-actions">
              <PeriodSelect
                value={period}
                onChange={setPeriod}
                customRange={customRange}
                onCustomChange={onCustomChange}
              />
            </div>
          </div>
          {deviceState.loading ? (
            <div className="empty-state">{t("Loading device stats…")}</div>
          ) : deviceState.error ? (
            <div className="empty-state error">{deviceState.error}</div>
          ) : platformData.length === 0 ? (
            <div className="empty-state">{t("No device data available.")}</div>
          ) : (
            <>
              <DeviceMix rows={platformData} t={t} />
              <WasteCallout rows={wasteRows} totalClicks={deviceTotals.clicks} t={t} />
            </>
          )}
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.settle, delay: 0.08, ease: EASE }}
        >
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("Operating Systems")}</h2>
              <p className="panel-subtitle">{t("Ranked. Orange means clicks without revenue.")}</p>
            </div>
            <div className="panel-actions">
              <div className="pl-switch" role="group" aria-label={t("Measure")}>
                {OS_METRICS.map((m) => (
                  <button
                    type="button"
                    key={m.key}
                    className={osMetric === m.key ? "is-active" : ""}
                    onClick={() => setOsMetric(m.key)}
                    aria-pressed={osMetric === m.key}
                  >
                    {t(m.label)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <OsComparison rows={osChartData} metric={osMetric} t={t} />
        </motion.div>

        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.settle, delay: 0.12, ease: EASE }}
        >
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("OS Versions")}</h2>
              <p className="panel-subtitle">
                {t("Where the traffic actually sits — decides whether a version cutoff is safe.")}
              </p>
            </div>
          </div>
          <OsVersions rows={osVersionData} t={t} />
        </motion.div>
      </section>

      <section className="entries-section">
        <motion.div
          className="panel form-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.settle, ease: EASE }}
        >
          <div className="panel-head">
            <div>
              <h2 className="panel-title">{t("Device Breakdown")}</h2>
              <p className="panel-subtitle">{t("Clicks, installs, revenue, and CR by device.")}</p>
            </div>
          </div>

          {deviceState.loading ? (
            <div className="empty-state">{t("Loading device stats…")}</div>
          ) : deviceState.error ? (
            <div className="empty-state error">{deviceState.error}</div>
          ) : deviceChartData.length === 0 ? (
            <div className="empty-state">{t("No device data available yet.")}</div>
          ) : (
            <>
            <div className="table-wrap">
              <table className="entries-table pl-table">
                <thead>
                  <tr>
                    <th>{t("Device")}</th>
                    <th>{t("OS")}</th>
                    <th>{t("OS Version")}</th>
                    <th>{t("Device Model")}</th>
                    <th>{t("Clicks")}</th>
                    <th>{t("Installs")}</th>
                    <th>{t("Registers")}</th>
                    <th>{t("FTDs")}</th>
                    <th>{t("Revenue")}</th>
                    <th>{t("Conversion Rate")}</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedDeviceRows.map((row, idx) => {
                    const stats = deviceMap.get(row.key);
                    const rank = devicePagination.from + idx + 1;
                    return (
                      <tr key={row.key}>
                        <td>
                          <span className="pl-name">
                            <span className={`pl-rank${rank <= 3 ? " is-top" : ""}`}>{rank}</span>
                            <span className="pl-name-text" title={row.device}>{row.device}</span>
                          </span>
                        </td>
                        <td>{row.os || "—"}</td>
                        <td>{row.osVersion || "—"}</td>
                        <td>{row.deviceModel || "—"}</td>
                        <td className="num">
                          <span className="pl-cell">
                            <span>{row.clicks.toLocaleString()}</span>
                            {maxDeviceClicks > 0 ? (
                              <span className="pl-bar is-clicks">
                                <span style={{ width: `${Math.max((row.clicks / maxDeviceClicks) * 100, 1)}%` }} />
                              </span>
                            ) : null}
                          </span>
                        </td>
                        <td className="num">{row.installs.toLocaleString()}</td>
                        <td className="num">{stats?.registers.toLocaleString() || "0"}</td>
                        <td className="num">{stats?.ftds.toLocaleString() || "0"}</td>
                        <td className="num">{formatCurrency(row.revenue)}</td>
                        <td className="num">
                          {/* A CR on a handful of clicks is noise; show the
                              denominator instead of colouring it as a winner. */}
                          <span className={`pl-rate ${row.clicks < 30 ? "is-thin" : row.cr >= 1 ? "is-strong" : "is-weak"}`}>
                            {`${row.cr.toFixed(2)}%`}
                            {row.clicks < 30 ? <em className="pl-flag is-muted"> n={row.clicks}</em> : null}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pager
              page={devicePagination.page}
              pageCount={devicePagination.pageCount}
              pageList={devicePagination.pageList}
              setPage={devicePagination.setPage}
              from={devicePagination.from}
              shown={pagedDeviceRows.length}
              total={deviceChartData.length}
              noun={t("devices")}
            />
            </>
          )}
        </motion.div>
      </section>
    </>
  );
}
