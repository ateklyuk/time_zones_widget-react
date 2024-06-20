define([
	"./index.js",
	"./modules/moment.js",
	"./modules/moment_tz.js",
], function (App, moment, moment_tz) {
	const Widget = function () {
		const self = this;
		class WidgetTimeZoneHelper {
			constructor() {
				this.settingsWarningTemplate = `<div class="reon-widget-timezone__settings-warning">
                    <span class="reon-widget-timezone__settings-warning-important"> ВАЖНО! Для корректной работы виджета, пожалуйста, заполните требуемые поля и нажмите кнопку "Cохранить"</span>
                </div>`;
			}

			render(tamplate, targetElement, position = "beforeend") {
				targetElement.insertAdjacentHTML(position, tamplate);
			}

			getTimeZoneWidgetTemplate(params, className) {
				return `<div class="reon-widget-timezone-general ${className}">
                        <span>${params.region} (${params.time_zone_GMT
					}), ${moment_tz().tz(params.time_zone).format("HH:mm")}</span>
                    </div>`;
			}

			getTimeZoneClassName(params) {
				const clientTimeZone = AMOCRM.constant("account").timezone;
				const currentTime = moment_tz().tz(params.time_zone);
				const startTime = moment()
					.hour(9)
					.minute(0)
					.second(0)
					.format("YYYY-MM-DD HH:mm");
				const startTimeByTimeZone = moment_tz.tz(startTime, params.time_zone);
				const finishTime = moment()
					.hour(18)
					.minute(0)
					.second(0)
					.format("YYYY-MM-DD HH:mm");
				const finishTimeByTimeZone = moment_tz.tz(finishTime, params.time_zone);
				if (
					clientTimeZone === params.time_zone &&
					moment(currentTime).isBefore(finishTimeByTimeZone) &&
					moment(currentTime).isAfter(startTimeByTimeZone)
				) {
					return "reon-timezone-widget-same-timezone-work-on";
				}
				if (
					clientTimeZone === params.time_zone &&
					(moment(currentTime).isAfter(finishTimeByTimeZone) ||
						moment(currentTime).isBefore(startTimeByTimeZone))
				) {
					return "reon-timezone-widget-same-timezone-work-off";
				}
				if (
					clientTimeZone !== params.time_zone &&
					moment(currentTime).isBefore(finishTimeByTimeZone) &&
					moment(currentTime).isAfter(startTimeByTimeZone)
				) {
					return "reon-timezone-widget-another-timezone-work-on";
				}
				if (
					clientTimeZone !== params.time_zone &&
					(moment(currentTime).isAfter(finishTimeByTimeZone) ||
						moment(currentTime).isBefore(startTimeByTimeZone))
				) {
					return "reon-timezone-widget-another-timezone-work-off";
				}
			}
		}
		const WidgetTime = new WidgetTimeZoneHelper();

		this.callbacks = {
			render: async function () {
				const settings = self.get_settings();
				const area = self.system().area;
				if (!settings.contactFields) {
					settings.contactFields = {
						phonesFieldId: null,
					};
				}
				if (!settings.contactFields.phonesFieldId && settings.phone_field_id) {
					settings.contactFields = {
						phonesFieldId: Number(settings.phone_field_id),
					};
				}
				if (area === "ccard" || area === "lcard" || area === "comcard") {
					const enableInputs = document.querySelectorAll(
						`input[data-enable-filter]`
					);
					const activePhoneNumberInputs = Array.from(enableInputs).filter(
						(element) => {
							if (
								element.attributes.name.nodeValue.includes(
									`CFV[${settings.contactFields.phonesFieldId}]`
								) &&
								element.defaultValue.length > 0
							) {
								return element;
							}
						}
					);
					const phoneNumbers = activePhoneNumberInputs.map(
						(element) => element.defaultValue
					);
					const fetchData = await fetch(
						"https://dev.reon.pro/widgets/timezone/codes?" +
						phoneNumbers.join("&")
					);
					const timezoneCodes = await fetchData.json();
					const multiplyButtons = [];
					activePhoneNumberInputs.forEach((element) => {
						const responseElement = timezoneCodes.find(
							(item) => item.phone === element.defaultValue
						);
						if (responseElement) {
							const className =
								WidgetTime.getTimeZoneClassName(responseElement);
							WidgetTime.render(
								WidgetTime.getTimeZoneWidgetTemplate(
									responseElement,
									className
								),
								element.closest(".linked-form__field__value")
							);
						}
						const multiplyPlusButton = element
							.closest(".linked-form__multiple-container")
							.querySelector(".linked-form__field-add-multiple");
						if (!multiplyButtons.includes(multiplyPlusButton)) {
							multiplyButtons.push(multiplyPlusButton);
						}
					});
					multiplyButtons.forEach((elem) => {
						elem.addEventListener("click", () => {
							setTimeout(() => {
								const allTimezoneLocalItemList = elem
									.closest(".linked-form__multiple-container")
									.querySelectorAll(".reon-widget-timezone-general");
								if (allTimezoneLocalItemList) {
									allTimezoneLocalItemList[
										allTimezoneLocalItemList.length - 1
									].remove();
								}
							}, 100);
						});
					});
				}
				App.default.render();
				return true;
			},
			init: function () {
				const settings = self.get_settings();
				const { path, version } = settings;
				const cssPath = `link[href="${path}/style.css?v=${version}"`;
				const linkTag = `<link href="${path}/style.css?v=${version}" type="text/css" rel="stylesheet">`;
				const cssLink = document.querySelector(cssPath);
				if (!cssLink) {
					WidgetTime.render(
						linkTag,
						document.querySelector("head"),
						"beforeend"
					);
				}
				return true;
			},
			dpSettings() {
				App.default.dpSettings();
				return true;
			},
			bind_actions: function () {
				return true;
			},
			settings: async function () {
				const settings = self.get_settings();
				const accountPhoneFieldId = document.querySelector(
					`input[name="phone_field_id"]`
				);
				accountPhoneFieldId.parentNode.parentNode.classList.add(
					"visually-hidden"
				);
				if (!settings.contactFields.phonesFieldId && !settings.phone_field_id) {
					fetch("/api/v4/contacts/custom_fields")
						.then((response) => response.json())
						.then((json) =>
							json._embedded.custom_fields.find(
								(field) => field.code === "PHONE"
							)
						)
						.then((phoneField) => {
							settings.contactFields.phonesFieldId = phoneField.id;
							accountPhoneFieldId.value = `${phoneField.id}`;
						})
						.catch((err) => {
							throw new Error(err);
						});
				}
				await App.default.settings();
				return true;
			},
			onSave: async function () {
				const settings = self.get_settings();
				const userNameInputSetting =
					document.querySelector("[name=client_name]");
				const phoneNumberInput = document.querySelector("[name=phone_number]");
				const termsOfUseField = document.querySelector('[name="terms_of_use"]');
				const newLead = {
					userName: userNameInputSetting.value,
					userPhone: phoneNumberInput.value,
					account: AMOCRM.constant("account").id,
					widgetName: "Часовые пояса",
					termsOfUse: termsOfUseField.value,
					accountSubdomain: AMOCRM.constant("account").subdomain,
					widgetStatus: settings.active,
					client_uuid: settings.oauth_client_uuid,
					enumId: 1067949,
				};
				await App.default.onSave(newLead);
				return true;
			},
			destroy: async function () {
				await App.default.destroy();
				return true;
			},
		};
		return this;
	};
	return Widget;
});
