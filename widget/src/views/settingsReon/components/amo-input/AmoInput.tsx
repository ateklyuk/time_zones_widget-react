import React from 'react';
import cl from './AmoInput.module.scss';

type AmoInputProps = {
	label: string
	value: string | number
	isValidate: boolean
	onChangeHandler: (event:React.ChangeEvent<HTMLInputElement>) => void
}

const AmoInput = ({ value, isValidate, onChangeHandler, label }:AmoInputProps) => {
	return (
		<div className={cl['amo-input__label-input']}>
			<div className="widget_settings_block__title_field reon_widget_settings-label">
				{ label }
			</div>
			<div className="widget_settings_block__input_field">
				<input
					className="widget_settings_block__controls__ text-input"
					type="text"
					value={value}
					placeholder=""
					autoComplete="off"
					onChange={onChangeHandler}
				/>
			</div>
			{
				isValidate &&
				<span className={cl['amo-input__label-input-note']} >*Поле обязательное для заполнения</span>
			}
		</div>
	)
}

export default AmoInput
