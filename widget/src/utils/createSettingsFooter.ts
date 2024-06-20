export const SettingsREON = {
	createSettingsFooter: () => {
		const settingsSection = document.querySelector('.widget-settings__desc-space') as HTMLElement;
		settingsSection.style.marginBottom  = '60px';
		const settingsBlock = document.querySelector('.widget-settings__wrap-desc-space') as HTMLElement;
		settingsBlock.classList.add('reon-mailer-settings__footer--relative')
		settingsBlock.insertAdjacentHTML('beforeend',
			`
		<div class="reon-mailer-settings__footer">
			<div class="reon-mailer-settings__footer-text">
				Напишите нам и мы найдем решение вашей задачи.
			</div>
			<div class="reon-mailer-settings__footer-contacts">
				<div class="reon-mailer-settings__footer-contacts-item">
					<a href="https://reon.pro/email2" target="_blank" >
						<img src="https://thumb.tildacdn.com/tild3866-3438-4139-b137-323134633338/-/resize/175x/-/format/webp/Component_4.png" alt="reon.pro">
					</a>
				</div>
				<div class="reon-mailer-settings__footer-contacts-item">
					<a href="mailto:reon.helpdesk@gmail.com" target="_blank">reon.helpdesk@gmail.com</a>
				</div>
				<div class="reon-mailer-settings__footer-contacts-item">
					<a href="tel:+79381083338" target="_blank">+7(938)-108-33-38</a>
				</div>
			</div>
		</div>
		`)
	},
	hideSystemFields: (settingsRoot: HTMLElement) => {
		const amoInputs: NodeListOf<HTMLDivElement> = settingsRoot.querySelectorAll('.widget_settings_block__item_field');
        amoInputs.forEach(input => {
            const block = input;
            block.style.display = 'none'
        });
	},
	insertSettingsCarcass: (settingsRoot: HTMLElement) => {
		settingsRoot.insertAdjacentHTML('afterbegin',
			`<div id="reon-widget-settings" style="margin-bottom: -57px">
				<div id="reon-widget-settings__content" class="reon-widget-settings__content">
				</div>
				<div class="reon-widget-settings__save">
				</div>
				<div id="reon-widget-settings__footer" class="reon-widget-settings__footer">
				</div>
			</div>`
		);
	},
	replaceSaveButton: (settingsRoot: HTMLElement) => {
		const settingsSaveRoot = settingsRoot.querySelector('.reon-widget-settings__save');
        const saveBlock = settingsRoot.querySelector('.widget_settings_block__controls.widget_settings_block__controls_top');
        if (saveBlock && settingsSaveRoot) {
            settingsSaveRoot.insertBefore(saveBlock, null);
        }
	}
}