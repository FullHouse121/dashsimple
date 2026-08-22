export const defaultKeitaroOverallPayloadObject = {
  dimensions: ["day", "campaign", "country", "city", "sub_id_1", "source", "sub_id_3", "sub_id_4", "sub_id_5"],
  measures: [
    "clicks",
    "regs",
    "custom_conversion_8",
    "custom_conversion_7",
    "custom_conversion_8_revenue",
    "custom_conversion_7_revenue",
    "cost",
  ],
  range: { interval: "first_day_of_this_month", timezone: "Asia/Dubai" },
  filters: [
    {
      name: "campaign",
      operator: "MATCH_REGEXP",
      expression: "(Leo|Leticia|Carvalho|Akku|Enzo|Matheus|Sara|ZM ?apps|ZMAPPS)",
    },
  ],
  limit: 1000,
  offset: 0,
  sort: [],
  summary: true,
  extended: true,
};

export const defaultKeitaroDevicePayloadObject = {
  dimensions: ["day", "campaign", "country", "device_type", "os", "os_version"],
  measures: [
    "clicks",
    "regs",
    "custom_conversion_8",
    "custom_conversion_7",
    "custom_conversion_8_revenue",
    "custom_conversion_7_revenue",
    "cost",
  ],
  range: { interval: "last_7_days", timezone: "Asia/Dubai" },
  filters: [
    {
      name: "campaign",
      operator: "MATCH_REGEXP",
      expression: "(Leo|Leticia|Carvalho|Akku|Enzo|Matheus|Sara|ZM ?apps|ZMAPPS)",
    },
  ],
  limit: 1000,
  offset: 0,
  sort: [],
  summary: true,
  extended: true,
};

export const stringifyKeitaroPayload = (value) => JSON.stringify(value, null, 2);

export const defaultKeitaroPayloadByTarget = {
  overall: stringifyKeitaroPayload(defaultKeitaroOverallPayloadObject),
  device: stringifyKeitaroPayload(defaultKeitaroDevicePayloadObject),
  user_behavior: stringifyKeitaroPayload({
    dimensions: ["day", "campaign", "country", "region", "city", "sub_id_1", "external_id"],
    measures: [
      "clicks",
      "regs",
      "custom_conversion_8",
      "custom_conversion_7",
      "custom_conversion_8_revenue",
      "custom_conversion_7_revenue",
      "cost",
    ],
    range: { interval: "last_7_days", timezone: "Asia/Dubai" },
    filters: [
      {
        name: "campaign",
        operator: "MATCH_REGEXP",
        expression: "(Leo|Leticia|Carvalho|Akku|Enzo|Matheus|Sara|ZM ?apps|ZMAPPS)",
      },
    ],
    limit: 1000,
    offset: 0,
    sort: [],
    summary: true,
    extended: true,
  }),
};

export const defaultKeitaroPayload = defaultKeitaroPayloadByTarget.overall;

// Column defaults for the Keitaro report builder — the mapping a fresh
// session starts from before the view overrides any field.
export const defaultKeitaroMapping = {
  dateField: "day",
  buyerField: "campaign",
  campaignField: "campaign",
  countryField: "country",
  cityField: "city",
  regionField: "region",
  placementField: "sub_id_1",
  domainField: "source",
  campaignNameField: "sub_id_3",
  adsetNameField: "sub_id_4",
  adNameField: "sub_id_5",
  externalIdField: "external_id",
  spendField: "cost",
  revenueField: "revenue",
  ftdRevenueField: "custom_conversion_8_revenue",
  redepositRevenueField: "custom_conversion_7_revenue",
clicksField: "clicks",
installsField: "installs",
registersField: "regs",
ftdsField: "custom_conversion_8",
redepositsField: "custom_conversion_7",
deviceField: "device_type",
osField: "os",
osVersionField: "os_version",
osIconField: "os_icon",
deviceModelField: "device_model",
};
