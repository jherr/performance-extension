import { getTTFB, getLCP, getFID, getFCP, getCLS } from "web-vitals";
import { InfluxDB, Point } from "@influxdata/influxdb-client-browser";

const token =
  "FA8znkxlXzN1S81jKIOQLhqGx7nnpxgXjp-oSO9hEcfNkljPNPneNs2Ir15h_7g5pCsX0H_txtYB-Ab44-MUMw==";
const org = "jack@muttmansion.com";
const bucket = "PerformanceData";

const client = new InfluxDB({
  url: "https://us-west-2-1.aws.cloud2.influxdata.com",
  token: token,
});

const infoDiv = document.createElement("div");
infoDiv.style.position = "fixed";
infoDiv.style.left = 0;
infoDiv.style.top = 0;
infoDiv.style.zIndex = 0;
infoDiv.style.backgroundColor = "black";
infoDiv.style.color = "white";
infoDiv.style.padding = "1rem";
infoDiv.style.fontFamily = "Arial";
document.body.appendChild(infoDiv);

const metrics = {};
const gatherMetrics = ({ name, value }) => {
  metrics[name] = value;
  const writeApi = client.getWriteApi(org, bucket);
  writeApi.useDefaultTags({ host: "host1" });

  const point = new Point("perf").floatField(name, value);
  writeApi.writePoint(point);
  writeApi.close();

  chrome.runtime.sendMessage({
    type: "performance:metric",
    name,
    value,
  });

  const metricsHTML = Object.keys(metrics)
    .map((k) => `<div>${k}</div><div>${Math.round(metrics[k])}</div>`)
    .join("");

  infoDiv.innerHTML = `
<div style="font-weight:bold;font-size:x-large">Perf Metrics</div>
<div style="display:grid; grid-template-columns: 1fr 1fr; grid-column-gap: 1rem;">
  <div>Metric</div>
  <div>Value</div>
  ${metricsHTML}
</div>
  `;
};

getTTFB(gatherMetrics);
getLCP(gatherMetrics);
getFID(gatherMetrics);
getFCP(gatherMetrics);
getCLS(gatherMetrics);
