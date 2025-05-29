import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { memo, useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { ApexOptions } from 'apexcharts';
import { useTranslation } from 'react-i18next';

/**
 * Gender widget.
 */
function RegistrationWidget({ seats, registrations }) {
	const { t } = useTranslation('dashboard');
	const totalSeats = seats ?? -1;
	const totalRegistrations = registrations ?? 0;
	const seats_available: any = totalSeats === -1 ? 'Unlimited' : totalSeats - totalRegistrations;

	const registrations_percentage = totalSeats === -1
		? (totalRegistrations === 0 ? 0 : 100)
		: ((totalRegistrations / totalSeats) * 100);

	const available_percentage = totalSeats === -1
		? (totalRegistrations === 0 ? 100 : 0)
		: ((seats_available / totalSeats) * 100);

	const widget = {
		"uniqueVisitors": totalSeats,
		"series": totalSeats !== null ? [available_percentage, registrations_percentage] : [],
		"seriesCounts": totalSeats !== null ? [seats_available, totalRegistrations] : [],
		"labels": [
			t("dashboard_widget_seats_available"),
			t("dashboard_widget_registrations"),
		]
	}

	if (!widget) {
		return null;
	}

	const { series, labels, seriesCounts, uniqueVisitors } = widget;
	const [awaitRender, setAwaitRender] = useState(true);
	const theme = useTheme();

	const chartOptions: ApexOptions = {
		chart: {
			animations: {
				speed: 400,
				animateGradually: {
					enabled: false
				}
			},
			fontFamily: 'inherit',
			foreColor: 'inherit',
			height: '100%',
			type: 'donut',
			sparkline: {
				enabled: true
			}
		},
		colors: ['#319795', '#4FD1C5'],
		labels,
		plotOptions: {
			pie: {
				customScale: 0.9,
				expandOnClick: false,
				donut: {
					size: '70%'
				}
			}
		},
		stroke: {
			colors: [theme.palette.background.paper]
		},
		series,
		states: {
			hover: {
				filter: {
					type: 'none'
				}
			},
			active: {
				filter: {
					type: 'none'
				}
			}
		},
		tooltip: {
			enabled: true,
			fillSeriesColor: false,
			theme: 'dark',
			custom: ({ seriesIndex, w }) =>
				`<div class="flex items-center h-32 min-h-32 max-h-23 px-12">
					<div class="w-12 h-12 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
					<div class="ml-8 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
					<div class="ml-8 text-md font-bold leading-none">${w.config.series[seriesIndex].toFixed(2)}%</div>
				</div>`
		}
	};

	useEffect(() => {
		setAwaitRender(false);
	}, []);

	if (awaitRender) {
		return null;
	}

	return (

		<Paper className="flex flex-col flex-auto shadow rounded-2xl overflow-hidden p-24 h-full">
			<div className="flex flex-col sm:flex-row items-start justify-between">
				<Typography className="text-lg font-medium tracking-tight leading-6 truncate">{t('dashboard_widget_title')}</Typography>
				{/* <div className="ml-8">
					<Chip
						size="small"
						className="font-medium text-sm"
						label=" 30 days"
					/>
				</div> */}
			</div>

			<div className="flex flex-col flex-auto mt-24 h-192">
				<ReactApexChart
					className="flex flex-auto items-center justify-center w-full h-full"
					options={chartOptions}
					series={series}
					type={chartOptions?.chart?.type}
					height={chartOptions?.chart?.height}
				/>
			</div>
			<div className="mt-32">
				<div className="-my-12 divide-y">
					<div
						className="grid grid-cols-2 py-12"
						key={0}
					>
						<div className="flex items-center flex-1">
							<Box
								className="flex-0 w-8 h-8 rounded-full"
								sx={{ backgroundColor: 'red' }}
							/>
							<Typography className="ml-12 truncate">{t("dashboard_widget_total_seats")}</Typography>
						</div>
						<Typography
							className="text-right"
							color="text.secondary"
						>
							{(seats == -1) || seats == null ? t('dashboard_widget_unlimited') : seats}
						</Typography>
					</div>
					{seriesCounts.map((dataset, i) => (
						<div
							className="grid grid-cols-2 py-12"
							key={i}
						>
							<div className="flex items-center flex-1">
								<Box
									className="flex-0 w-8 h-8 rounded-full"
									sx={{ backgroundColor: chartOptions?.colors?.[i] as string }}
								/>
								<Typography className="ml-12 truncate">{labels[i]}</Typography>
							</div>
							<Typography
								className="text-right"
								color="text.secondary"
							>
								{seats === -1 && labels[i] === "Seats Available" ? t('dashboard_widget_unlimited') : dataset == 'Unlimited' ? t('dashboard_widget_unlimited') : dataset}
							</Typography>
						</div>
					))}
				</div>
			</div>
		</Paper>
	);
}

export default memo(RegistrationWidget);
