import { styled, Tooltip, tooltipClasses, TooltipProps, Typography } from '@mui/material';
import React, { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsApi } from 'src/app/main/sign-up/apis/Settings-Api';

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
	<Tooltip
		{...props}
		classes={{ popper: className }}
	/>
))(({ theme }) => ({
	[`& .${tooltipClasses.tooltip}`]: {
		backgroundColor: theme.palette.common.white,
		color: 'rgba(0, 0, 0, 0.87)',
		boxShadow: theme.shadows[1],
		fontSize: 11,
	}
}));

function hasUpperCase(password: string): boolean {
	for (let i = 0; i < password.length; i++) {
		if (password[i] >= 'A' && password[i] <= 'Z') {
			return true; // Found an uppercase letter
		}
	}
	return false; // No uppercase letter found
}

function hasSpecialCharacter(password: string): boolean {
	const regex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

	return regex.test(password);
}

function hasNumber(password: string): boolean {
	for (let i = 0; i < password.length; i++) {
		if (!isNaN(parseInt(password[i], 10))) {
			return true; // Found a numerical value
		}
	}
	return false; // No numerical value found
}

type PasswordForm = {
	passwordRange: string;
	requireMinimumOneNumerical: boolean;
	resetPasswordAfterFirstLogin: boolean;
	requireMinimumOneCapitalLetter: boolean;
	requireMinimumOneSpecialCharacter: boolean;
	enforcePasswordResetAfterPasswordResetedByAdmin: boolean;
};

type PasswordState = {
	_passwordRange: boolean;
	_requireMinimumOneNumerical: boolean;
	_requireMinimumOneSpecialCharacter: boolean;
	_requireMinimumOneCapitalLetter: boolean;
};

type Props = {
	children: ReactElement;
	isOpen: boolean;
	onClose: (event: Event) => void;
	password: string;
};

function OnionPasswordPreview({ children, isOpen, onClose, password }: Props) {
	const { t } = useTranslation();
	const [passwordData, setPasswordData] = useState<PasswordForm>();
	const [passwordRules, setPasswordRules] = useState<PasswordState>({
		_passwordRange: false,
		_requireMinimumOneNumerical: false,
		_requireMinimumOneSpecialCharacter: false,
		_requireMinimumOneCapitalLetter: false
	});

	useEffect(() => {
		getPasswordData();
	}, []);

	useEffect(() => {
		if (password !== undefined) {
			handleChange(password);
		}
		// if (!passwordRules._passwordRange || !passwordRules._requireMinimumOneCapitalLetter || !passwordRules._requireMinimumOneNumerical || !passwordRules._requireMinimumOneSpecialCharacter) {
		// 	isOpen = true;
		// }
	}, [password]);

	const getPasswordData = async () => {
		const _passwordData = await SettingsApi({ settingsKey: 'password' });

		if (_passwordData) {
			setPasswordData(_passwordData);
		}
	};

	const handleChange = (e: any) => {
		if (passwordData !== undefined) {
			setPasswordRules((prevRules) => ({
				...prevRules,
				_passwordRange: e.length >= passwordData?.passwordRange,
				_requireMinimumOneNumerical: hasNumber(e),
				_requireMinimumOneSpecialCharacter: hasSpecialCharacter(e),
				_requireMinimumOneCapitalLetter: hasUpperCase(e)
			}));
		}
	};

	function PasswordTip() {
		return (
			<div className="flex flex-col space-y-2 w-full">
				{passwordData?.passwordRange && (
					<Typography
						variant="caption"
						color={passwordRules._passwordRange ? 'green' : 'red'}
					>
						* {t('shouldContainAtLeast')} {passwordData?.passwordRange} {t('letters')}
					</Typography>
				)}
				{passwordData?.requireMinimumOneCapitalLetter && (
					<Typography
						variant="caption"
						color={passwordRules._requireMinimumOneCapitalLetter ? 'green' : 'red'}
					>
						* {t('shouldContainMinimum1CapitalLetter')}
					</Typography>
				)}
				{passwordData?.requireMinimumOneNumerical && (
					<Typography
						variant="caption"
						color={passwordRules._requireMinimumOneNumerical ? 'green' : 'red'}
					>
						* {t('shouldContainMinimum1Numerical')}
					</Typography>
				)}
				{passwordData?.requireMinimumOneSpecialCharacter && (
					<Typography
						variant="caption"
						color={passwordRules._requireMinimumOneSpecialCharacter ? 'green' : 'red'}
					>
						* {t('shouldContainMinimum1SpecialCharacter')}
					</Typography>
				)}
			</div>
		);
	}

	return (
		<LightTooltip
			open={isOpen}
			onClose={onClose}
			placement="bottom"
			slotProps={{
				popper: {
					modifiers: [
						{
							name: 'offset',
							options: {
								offset: [0, -14]
							}
						}
					]
				}
			}}
			title={<PasswordTip />}
		>
			{children}
		</LightTooltip>
	);
}

export default OnionPasswordPreview;
