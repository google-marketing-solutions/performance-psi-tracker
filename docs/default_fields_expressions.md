Copyright 2025 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

# Performance PSI Tracker

## Default values for the Fields tab

### PSI API

|  Method |       Field       |                                                                                                                                                                                                              Data                                                                                                                                                                                                               |
|:-------:|:-----------------:|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|
| PSI API |       LH URL      | `content["lighthouseResult"]["finalUrl"]`                                                                                                                                                                                                                                                                                                                                                                                       |
| PSI API |     LH Version    | `content["lighthouseResult"]["lighthouseVersion"]`                                                                                                                                                                                                                                                                                                                                                                              |
| PSI API |   LH Performance  | `content["lighthouseResult"]["categories"]["performance"]["score"]*100`                                                                                                                                                                                                                                                                                                                                                         |
| PSI API |  LH Accessibility | `content["lighthouseResult"]["categories"]["accessibility"]["score"]*100`                                                                                                                                                                                                                                                                                                                                                       |
| PSI API | LH Best Practices | `content["lighthouseResult"]["categories"]["best-practices"]["score"]*100`                                                                                                                                                                                                                                                                                                                                                      |
| PSI API |       LH PWA      | `content["lighthouseResult"]["categories"]["pwa"]["score"]*100`                                                                                                                                                                                                                                                                                                                                                                 |
| PSI API |       LH SEO      | `content["lighthouseResult"]["categories"]["seo"]["score"]*100`                                                                                                                                                                                                                                                                                                                                                                 |
| PSI API |      LH TTFB      | `content["lighthouseResult"]["audits"]["server-response-time"]["numericValue`"]                                                                                                                                                                                                                                                                                                                                                 |
| PSI API |       LH FCP      | `content["lighthouseResult"]["audits"]["first-contentful-paint"]["numericValue`"]                                                                                                                                                                                                                                                                                                                                               |
| PSI API |   LH Speed Index  | `content["lighthouseResult"]["audits"]["speed-index"]["numericValue`"]                                                                                                                                                                                                                                                                                                                                                          |
| PSI API |       LH LCP      | `content["lighthouseResult"]["audits"]["largest-contentful-paint"]["numericValue`"]                                                                                                                                                                                                                                                                                                                                             |
| PSI API |       LH TTI      | `content["lighthouseResult"]["audits"]["interactive"]["numericValue`"]                                                                                                                                                                                                                                                                                                                                                          |
| PSI API |       LH TBT      | `content["lighthouseResult"]["audits"]["total-blocking-time"]["numericValue`"]                                                                                                                                                                                                                                                                                                                                                  |
| PSI API |       LH CLS      | `content["lighthouseResult"]["audits"]["cumulative-layout-shift"]["numericValue`"]                                                                                                                                                                                                                                                                                                                                              |
| PSI API |      LH Size      | `content["lighthouseResult"]["audits"]["network-requests"]["details"]["items"].reduce((a,b)=>a+b.resourceSize,0`)                                                                                                                                                                                                                                                                                                               |
| PSI API |     LH Script     | `content["lighthouseResult"]["audits"]["network-requests"]["details"]["items"].filter(d=>d["resourceType"] == "Script").reduce((a,b)=>a+b.resourceSize,0`)                                                                                                                                                                                                                                                                      |
| PSI API |      LH Image     | `content["lighthouseResult"]["audits"]["network-requests"]["details"]["items"].filter(d=>d["resourceType"] == "Image").reduce((a,b)=>a+b.resourceSize,0`)                                                                                                                                                                                                                                                                       |
| PSI API |   LH Stylesheet   | `content["lighthouseResult"]["audits"]["network-requests"]["details"]["items"].filter(d=>d["resourceType"] == "Stylesheet").reduce((a,b)=>a+b.resourceSize,0`)                                                                                                                                                                                                                                                                  |
| PSI API |    LH Document    | `content["lighthouseResult"]["audits"]["network-requests"]["details"]["items"].filter(d=>d["resourceType"] == "Document").reduce((a,b)=>a+b.resourceSize,0`)                                                                                                                                                                                                                                                                    |
| PSI API |      LH Font      | `content["lighthouseResult"]["audits"]["network-requests"]["details"]["items"].filter(d=>d["resourceType"] == "Font").reduce((a,b)=>a+b.resourceSize,0`)                                                                                                                                                                                                                                                                        |
| PSI API |      LH Other     | `content["lighthouseResult"]["audits"]["network-requests"]["details"]["items"] .filter(d=>["Document","Stylesheet","Font","Image","Script"].indexOf(d["resourceType"]) == -1) .reduce((a,b)=>a+b.resourceSize,0`)                                                                                                                                                                                                               |
| PSI API |      CrUX URL     | `(function a(){ if(urlOrOrigin=="URL" && content["loadingExperience"]["origin_fallback"] != true){ return content["loadingExperience"]["id"] } else if(urlOrOrigin == "Origin"){ return content["originLoadingExperience"]["id"] } else{ return ""; } })()`                                                                                                                     |
| PSI API |      CrUX FCP     | `(function a(){ if(urlOrOrigin=="URL" && content["loadingExperience"]["origin_fallback"] != true){ return content["loadingExperience"]["metrics"]["FIRST_CONTENTFUL_PAINT_MS"]["percentile"] } else if(urlOrOrigin == "Origin"){ return content["originLoadingExperience"]["metrics"]["FIRST_CONTENTFUL_PAINT_MS"]["percentile"] } else{ return ""; } })()`                     |
| PSI API |      CrUX LCP     | `(function a(){ if(urlOrOrigin=="URL" && content["loadingExperience"]["origin_fallback"] != true){ return content["loadingExperience"]["metrics"]["LARGEST_CONTENTFUL_PAINT_MS"]["percentile"] } else if(urlOrOrigin == "Origin"){ return content["originLoadingExperience"]["metrics"]["LARGEST_CONTENTFUL_PAINT_MS"]["percentile"] } else { return ""; } })()`                 |
| PSI API |      CrUX FID     | `(function a(){ if(urlOrOrigin=="URL" && content["loadingExperience"]["origin_fallback"] != true){ return content["loadingExperience"]["metrics"]["FIRST_INPUT_DELAY_MS"]["percentile"] } else if(urlOrOrigin == "Origin"){ return content["originLoadingExperience"]["metrics"]["FIRST_INPUT_DELAY_MS"]["percentile"] } else{ return ""; } })()`                               |
| PSI API |      CrUX CLS     | `(function a(){ if(urlOrOrigin=="URL" && content["loadingExperience"]["origin_fallback"] != true){ return content["loadingExperience"]["metrics"]["CUMULATIVE_LAYOUT_SHIFT_SCORE"]["percentile"] / 100 } else if(urlOrOrigin == "Origin"){ return content["originLoadingExperience"]["metrics"]["CUMULATIVE_LAYOUT_SHIFT_SCORE"]["percentile"] / 100 } else{ return ""; } })()` |
| PSI API |      CrUX INP     | `(function a(){ if(urlOrOrigin=="URL" && content["loadingExperience"]["origin_fallback"] != true){ return content["loadingExperience"]["metrics"]["INTERACTION_TO_NEXT_PAINT"]["percentile"] } else if(urlOrOrigin == "Origin"){ return content["originLoadingExperience"]["metrics"]["INTERACTION_TO_NEXT_PAINT"]["percentile"] } else{ return ""; } })()`                     |
| PSI API |     CrUX TTFB     | `(function a(){ if(urlOrOrigin=="URL" && content["loadingExperience"]["origin_fallback"] != true){ return content["loadingExperience"]["metrics"]["EXPERIMENTAL_TIME_TO_FIRST_BYTE"]["percentile"] } else if(urlOrOrigin == "Origin"){ return content["originLoadingExperience"]["metrics"]["EXPERIMENTAL_TIME_TO_FIRST_BYTE"]["percentile"] } else{ return ""; } })()`         |
| PSI API |   CrUX Data Dump  | `(function a(){ if(urlOrOrigin=="URL" && content["loadingExperience"]["origin_fallback"] != true){ return JSON.stringify(content["loadingExperience"]["metrics"]) } else if(urlOrOrigin == "Origin"){ return JSON.stringify(content["originLoadingExperience"]["metrics"]) } else{ return ""; } })()`                                                                           |
| PSI API |   Custom Field 1  | `"Hello" // Use the content variable containing the results from Lighthouse, ex: content["lighthouseResult"]["lighthouseVersion"]`                                                                                                                                                                                                                                                                                              |
| PSI API |   Custom Field 2  | `"World" // Use the content variable containing the results from Lighthouse, ex: content["lighthouseResult"]["lighthouseVersion"]`                                                                                                                                                                                                                                                                                              |

### Accessibility

|     Method    |                  Field                 |                                       Data                                         |
|:-------------:|:--------------------------------------:|:----------------------------------------------------------------------------------:|
| Accessibility |                 LH URL                 | `content["lighthouseResult"]["finalUrl"]`                                          |
| Accessibility |               LH Version               | `content["lighthouseResult"]["lighthouseVersion"]`                                 |
| Accessibility |             LH Performance             | `content["lighthouseResult"]["categories"]["performance"]["score"]*100`            |
| Accessibility |            LH Accessibility            | `content["lighthouseResult"]["categories"]["accessibility"]["score"]*100`          |
| Accessibility |           LH A11Y accesskeys           | `content["lighthouseResult"]["audits"]["accesskeys"]["score"]`                     |
| Accessibility |        LH A11Y aria-allowed-attr       | `content["lighthouseResult"]["audits"]["aria-allowed-attr"]["score"]`              |
| Accessibility |        LH A11Y aria-allowed-role       | `content["lighthouseResult"]["audits"]["aria-allowed-role"]["score"]`              |
| Accessibility |        LH A11Y aria-command-name       | `content["lighthouseResult"]["audits"]["aria-command-name"]["score"]`              |
| Accessibility |        LH A11Y aria-dialog-name        | `content["lighthouseResult"]["audits"]["aria-dialog-name"]["score"]`               |
| Accessibility |        LH A11Y aria-hidden-body        | `content["lighthouseResult"]["audits"]["aria-hidden-body"]["score"]`               |
| Accessibility |        LH A11Y aria-hidden-focus       | `content["lighthouseResult"]["audits"]["aria-hidden-focus"]["score"]`              |
| Accessibility |      LH A11Y aria-input-field-name     | `content["lighthouseResult"]["audits"]["aria-input-field-name"]["score"]`          |
| Accessibility |         LH A11Y aria-meter-name        | `content["lighthouseResult"]["audits"]["aria-meter-name"]["score"]`                |
| Accessibility |      LH A11Y aria-progressbar-name     | `content["lighthouseResult"]["audits"]["aria-progressbar-name"]["score"]`          |
| Accessibility |       LH A11Y aria-required-attr       | `content["lighthouseResult"]["audits"]["aria-required-attr"]["score"]`             |
| Accessibility |     LH A11Y aria-required-children     | `content["lighthouseResult"]["audits"]["aria-required-children"]["score"]`         |
| Accessibility |      LH A11Y aria-required-parent      | `content["lighthouseResult"]["audits"]["aria-required-parent"]["score"]`           |
| Accessibility |           LH A11Y aria-roles           | `content["lighthouseResult"]["audits"]["aria-roles"]["score"]`                     |
| Accessibility |            LH A11Y aria-text           | `content["lighthouseResult"]["audits"]["aria-text"]["score"]`                      |
| Accessibility |     LH A11Y aria-toggle-field-name     | `content["lighthouseResult"]["audits"]["aria-toggle-field-name"]["score"]`         |
| Accessibility |        LH A11Y aria-tooltip-name       | `content["lighthouseResult"]["audits"]["aria-tooltip-name"]["score"]`              |
| Accessibility |       LH A11Y aria-treeitem-name       | `content["lighthouseResult"]["audits"]["aria-treeitem-name"]["score"]`             |
| Accessibility |      LH A11Y aria-valid-attr-value     | `content["lighthouseResult"]["audits"]["aria-valid-attr-value"]["score"]`          |
| Accessibility |         LH A11Y aria-valid-attr        | `content["lighthouseResult"]["audits"]["aria-valid-attr"]["score"]`                |
| Accessibility |           LH A11Y button-name          | `content["lighthouseResult"]["audits"]["button-name"]["score"]`                    |
| Accessibility |             LH A11Y bypass             | `content["lighthouseResult"]["audits"]["bypass"]["score"]`                         |
| Accessibility |         LH A11Y color-contrast         | `content["lighthouseResult"]["audits"]["color-contrast"]["score"]`                 |
| Accessibility |         LH A11Y definition-list        | `content["lighthouseResult"]["audits"]["definition-list"]["score"]`                |
| Accessibility |             LH A11Y dlitem             | `content["lighthouseResult"]["audits"]["dlitem"]["score"]`                         |
| Accessibility |         LH A11Y document-title         | `content["lighthouseResult"]["audits"]["document-title"]["score"]`                 |
| Accessibility |       LH A11Y duplicate-id-active      | `content["lighthouseResult"]["audits"]["duplicate-id-active"]["score"]`            |
| Accessibility |        LH A11Y duplicate-id-aria       | `content["lighthouseResult"]["audits"]["duplicate-id-aria"]["score"]`              |
| Accessibility |   LH A11Y form-field-multiple-labels   | `content["lighthouseResult"]["audits"]["form-field-multiple-labels"]["score"]`     |
| Accessibility |           LH A11Y frame-title          | `content["lighthouseResult"]["audits"]["frame-title"]["score"]`                    |
| Accessibility |          LH A11Y heading-order         | `content["lighthouseResult"]["audits"]["heading-order"]["score"]`                  |
| Accessibility |          LH A11Y html-has-lang         | `content["lighthouseResult"]["audits"]["html-has-lang"]["score"]`                  |
| Accessibility |         LH A11Y html-lang-valid        | `content["lighthouseResult"]["audits"]["html-lang-valid"]["score"]`                |
| Accessibility |     LH A11Y html-xml-lang-mismatch     | `content["lighthouseResult"]["audits"]["html-xml-lang-mismatch"]["score"]`         |
| Accessibility |            LH A11Y image-alt           | `content["lighthouseResult"]["audits"]["image-alt"]["score"]`                      |
| Accessibility |       LH A11Y image-redundant-alt      | `content["lighthouseResult"]["audits"]["image-redundant-alt"]["score"]`            |
| Accessibility |        LH A11Y input-button-name       | `content["lighthouseResult"]["audits"]["input-button-name"]["score"]`              |
| Accessibility |         LH A11Y input-image-alt        | `content["lighthouseResult"]["audits"]["input-image-alt"]["score"]`                |
| Accessibility |   LH A11Y label-content-name-mismatch  | `content["lighthouseResult"]["audits"]["label-content-name-mismatch"]["score"]`    |
| Accessibility |              LH A11Y label             | `content["lighthouseResult"]["audits"]["label"]["score"]`                          |
| Accessibility |       LH A11Y link-in-text-block       | `content["lighthouseResult"]["audits"]["link-in-text-block"]["score"]`             |
| Accessibility |            LH A11Y link-name           | `content["lighthouseResult"]["audits"]["link-name"]["score"]`                      |
| Accessibility |              LH A11Y list              | `content["lighthouseResult"]["audits"]["list"]["score"]`                           |
| Accessibility |            LH A11Y listitem            | `content["lighthouseResult"]["audits"]["listitem"]["score"]`                       |
| Accessibility |          LH A11Y meta-refresh          | `content["lighthouseResult"]["audits"]["meta-refresh"]["score"]`                   |
| Accessibility |          LH A11Y meta-viewport         | `content["lighthouseResult"]["audits"]["meta-viewport"]["score"]`                  |
| Accessibility |           LH A11Y object-alt           | `content["lighthouseResult"]["audits"]["object-alt"]["score"]`                     |
| Accessibility |           LH A11Y select-name          | `content["lighthouseResult"]["audits"]["select-name"]["score"]`                    |
| Accessibility |            LH A11Y skip-link           | `content["lighthouseResult"]["audits"]["skip-link"]["score"]`                      |
| Accessibility |            LH A11Y tabindex            | `content["lighthouseResult"]["audits"]["tabindex"]["score"]`                       |
| Accessibility |      LH A11Y table-duplicate-name      | `content["lighthouseResult"]["audits"]["table-duplicate-name"]["score"]`           |
| Accessibility |       LH A11Y table-fake-caption       | `content["lighthouseResult"]["audits"]["table-fake-caption"]["score"]`             |
| Accessibility |          LH A11Y td-has-header         | `content["lighthouseResult"]["audits"]["td-has-header"]["score"]`                  |
| Accessibility |         LH A11Y td-headers-attr        | `content["lighthouseResult"]["audits"]["td-headers-attr"]["score"]`                |
| Accessibility |        LH A11Y th-has-data-cells       | `content["lighthouseResult"]["audits"]["th-has-data-cells"]["score"]`              |
| Accessibility |           LH A11Y valid-lang           | `content["lighthouseResult"]["audits"]["valid-lang"]["score"]`                     |
| Accessibility |          LH A11Y video-caption         | `content["lighthouseResult"]["audits"]["video-caption"]["score"]`                  |
| Accessibility |       LH A11Y focusable-controls       | `content["lighthouseResult"]["audits"]["focusable-controls"]["score"]`             |
| Accessibility | LH A11Y interactive-element-affordance | `content["lighthouseResult"]["audits"]["interactive-element-affordance"]["score"]` |
| Accessibility |        LH A11Y logical-tab-order       | `content["lighthouseResult"]["audits"]["logical-tab-order"]["score"]`              |
| Accessibility |    LH A11Y visual-order-follows-dom    | `content["lighthouseResult"]["audits"]["visual-order-follows-dom"]["score"]`       |
| Accessibility |           LH A11Y focus-traps          | `content["lighthouseResult"]["audits"]["focus-traps"]["score"]`                    |
| Accessibility |          LH A11Y managed-focus         | `content["lighthouseResult"]["audits"]["managed-focus"]["score"]`                  |
| Accessibility |          LH A11Y use-landmarks         | `content["lighthouseResult"]["audits"]["use-landmarks"]["score"]`                  |
| Accessibility |    LH A11Y offscreen-content-hidden    | `content["lighthouseResult"]["audits"]["offscreen-content-hidden"]["score"]`       |
| Accessibility |     LH A11Y custom-controls-labels     | `content["lighthouseResult"]["audits"]["custom-controls-labels"]["score"]`         |
| Accessibility |      LH A11Y custom-controls-roles     | `content["lighthouseResult"]["audits"]["custom-controls-roles"]["score"]`          |
| Accessibility |          LH A11Y empty-heading         | `content["lighthouseResult"]["audits"]["empty-heading"]["score"]`                  |
| Accessibility |  LH A11Y identical-links-same-purpose  | `content["lighthouseResult"]["audits"]["identical-links-same-purpose"]["score"]`   |
| Accessibility |        LH A11Y landmark-one-main       | `content["lighthouseResult"]["audits"]["landmark-one-main"]["score"]`              |
| Accessibility |           LH A11Y target-size          | `content["lighthouseResult"]["audits"]["target-size"]["score"]`                    |

### CrUX History

|    Method    |                Field               |                                                              Data                                                                |
|:------------:|:----------------------------------:|:--------------------------------------------------------------------------------------------------------------------------------:|
| CrUX History |           CrUX Data Dump           | `JSON.stringify(content)`                                                                                                        |
| CrUX History |              CrUX URL              | `content["record"]["key"]["url"]`                                                                                                |
| CrUX History |              CrUX FCP              | `content.record.metrics["first_contentful_paint"].percentilesTimeseries.p75s`                                                    |
| CrUX History |              CrUX LCP              | `content.record.metrics["largest_contentful_paint"].percentilesTimeseries.p75s`                                                  |
| CrUX History |              CrUX FID              | `content.record.metrics["first_input_delay"].percentilesTimeseries.p75s`                                                         |
| CrUX History |              CrUX CLS              | `content.record.metrics["cumulative_layout_shift"].percentilesTimeseries.p75s`                                                   |
| CrUX History |              CrUX INP              | `content.record.metrics["interaction_to_next_paint"].percentilesTimeseries.p75s`                                                 |
| CrUX History |              CrUX TTFB             | `content.record.metrics["experimental_time_to_first_byte"].percentilesTimeseries.p75s`                                           |
| CrUX History |                Date                | `content.record.collectionPeriods.map(date=>new Date(date.lastDate.year, date.lastDate.month-1, date.lastDate.day, 0, 0, 0, 0))` |
| CrUX History |           CrUX Navigation          | `JSON.stringify(content.record.metrics["navigation_types"])`                                                                     |
| CrUX History |    CrUX Navigation Back Forward    | `content.record.metrics["navigation_types"]["fractionTimeseries"]["back_forward"]["fractions"]`                                  |
| CrUX History | CrUX Navigation Back Forward Cache | `content.record.metrics["navigation_types"]["fractionTimeseries"]["back_forward_cache"]["fractions"]`                            |
| CrUX History |      CrUX Navigation Navigate      | `content.record.metrics["navigation_types"]["fractionTimeseries"]["navigate"]["fractions"]`                                      |
| CrUX History |   CrUX Navigation Navigate Cache   | `content.record.metrics["navigation_types"]["fractionTimeseries"]["navigate_cache"]["fractions"]`                                |
| CrUX History |      CrUX Navigation Prerender     | `content.record.metrics["navigation_types"]["fractionTimeseries"]["prerender"]["fractions"]`                                     |
| CrUX History |       CrUX Navigation Reload       | `content.record.metrics["navigation_types"]["fractionTimeseries"]["reload"]["fractions"]`                                        |
| CrUX History |       CrUX Navigation Restore      | `content.record.metrics["navigation_types"]["fractionTimeseries"]["restore"]["fractions"]`                                       |

### CrUX

| Method |                Field               |                                      Data                                       |
|:------:|:----------------------------------:|:-------------------------------------------------------------------------------:|
|  CrUX  |           CrUX Data Dump           | `JSON.stringify(content)`                                                       |
|  CrUX  |              CrUX URL              | `content["record"]["key"]["url"]`                                               |
|  CrUX  |              CrUX FCP              | `content.record.metrics["first_contentful_paint"].percentiles.p75`              |
|  CrUX  |              CrUX LCP              | `content.record.metrics["largest_contentful_paint"].percentiles.p75`            |
|  CrUX  |              CrUX FID              | `content.record.metrics["first_input_delay"].percentiles.p75`                   |
|  CrUX  |              CrUX CLS              | `content.record.metrics["cumulative_layout_shift"].percentiles.p75`             |
|  CrUX  |              CrUX INP              | `content.record.metrics["interaction_to_next_paint"].percentiles.p75`           |
|  CrUX  |              CrUX TTFB             | `content.record.metrics["experimental_time_to_first_byte"].percentiles.p75`     |
|  CrUX  |          CrUX Form Factors         | `JSON.stringify(content.record.metrics["form_factors"])`                        |
|  CrUX  |           CrUX Navigation          | `JSON.stringify(content.record.metrics["navigation_types"])`                    |
|  CrUX  |    CrUX Navigation Back Forward    | `content.record.metrics["navigation_types"]["fractions"]["back_forward"]`       |
|  CrUX  | CrUX Navigation Back Forward Cache | `content.record.metrics["navigation_types"]["fractions"]["back_forward_cache"]` |
|  CrUX  |      CrUX Navigation Navigate      | `content.record.metrics["navigation_types"]["fractions"]["navigate"]`           |
|  CrUX  |   CrUX Navigation Navigate Cache   | `content.record.metrics["navigation_types"]["fractions"]["navigate_cache"]`     |
|  CrUX  |      CrUX Navigation Prerender     | `content.record.metrics["navigation_types"]["fractions"]["prerender"]`          |
|  CrUX  |       CrUX Navigation Reload       | `content.record.metrics["navigation_types"]["fractions"]["reload"]`             |
|  CrUX  |       CrUX Navigation Restore      | `content.record.metrics["navigation_types"]["fractions"]["restore"]`            |

### Green Domain

|    Method    |         Field         |                       Data                    |
|:------------:|:---------------------:|:---------------------------------------------:|
| Green Domain |        GWF URL        | `content["url"]`                              |
| Green Domain |     GWF Hosted By     | `content["hosted_by"]`                        |
| Green Domain | GWF Hosted By Website | `content["hosted_by_website"]`                |
| Green Domain |      GWF Partner      | `content["partner"]`                          |
| Green Domain |       GWF Green       | `content["green"]`                            |
| Green Domain |    GWF Hosted By ID   | `content["hosted_by_id"]`                     |
| Green Domain |   GWF Modified Date   | `content["modified"]`                         |
| Green Domain |      GWF Doc0 ID      | `content["supporting_documents"][0]["id"]`    |
| Green Domain |     GWF Doc0 Title    | `content["supporting_documents"][0]["title"]` |
| Green Domain |     GWF Doc0 Link     | `content["supporting_documents"][0]["link"]`  |
| Green Domain |      GWF Doc1 ID      | `content["supporting_documents"][1]["id"]`    |
| Green Domain |     GWF Doc1 Title    | `content["supporting_documents"][1]["title"]` |
| Green Domain |     GWF Doc1 Link     | `content["supporting_documents"][1]["link"]`  |
| Green Domain |      GWF Doc2 ID      | `content["supporting_documents"][2]["id"]`    |
| Green Domain |     GWF Doc2 Title    | `content["supporting_documents"][2]["title"]` |
| Green Domain |     GWF Doc2 Link     | `content["supporting_documents"][2]["link"]`  |
| Green Domain |      GWF Doc3 ID      | `content["supporting_documents"][3]["id"]`    |
| Green Domain |     GWF Doc3 Title    | `content["supporting_documents"][3]["title"]` |
| Green Domain |     GWF Doc3 Link     | `content["supporting_documents"][3]["link"]`  |
| Green Domain |      GWF Doc4 ID      | `content["supporting_documents"][4]["id"]`    |
| Green Domain |     GWF Doc4 Title    | `content["supporting_documents"][4]["title"]` |
| Green Domain |     GWF Doc4 Link     | `content["supporting_documents"][4]["link"]`  |

### Sustainability

| Method         | Field                  | Data                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
|----------------|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Sustainability |         LH URL         | `content["lighthouseResult"]["finalUrl"]`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Sustainability |         LH Size        | `content["lighthouseResult"]["audits"]["diagnostics"]["details"]["items"]["0"]["totalByteWeight"]`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Sustainability |    GWF Green Hosted    | `(function a(){ let regex = new RegExp(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img); let origin_regex = ""; try{ origin_regex = regex.exec(content["lighthouseResult"]["finalUrl"])[1] } catch(e){ throw "Error in Parsing domains" } return green_domains.indexOf(origin_regex) != -1})()`                                                                                                                                                                                                                                                               |
| Sustainability |  CO2.JS (Model = SWD)  | `(function a(){ let regex = new RegExp(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img); let origin_regex = ""; try{ origin_regex = regex.exec(content["lighthouseResult"]["finalUrl"])[1] } catch(e){ throw "Error in Parsing domains" } is_green = green_domains.indexOf(origin_regex) != -1 size = content["lighthouseResult"]["audits"]["diagnostics"]["details"]["items"]["0"]["totalByteWeight"] const swd = new co2.co2({ model: "swd" }) let emissions = swd.perByte(size, is_green) return emissions })()`           |
| Sustainability | CO2.JS (Model = 1BYTE) | `(function a(){ let regex = new RegExp(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img); let origin_regex = ""; try{ origin_regex = regex.exec(content["lighthouseResult"]["finalUrl"])[1] } catch(e){ throw "Error in Parsing domains" } is_green = green_domains.indexOf(origin_regex) != -1 size = content["lighthouseResult"]["audits"]["diagnostics"]["details"]["items"]["0"]["totalByteWeight"] const oneByte = new co2.co2({ model: "1byte" }) let emissions = oneByte.perByte(size, is_green) return emissions })()` |
