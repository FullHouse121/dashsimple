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
