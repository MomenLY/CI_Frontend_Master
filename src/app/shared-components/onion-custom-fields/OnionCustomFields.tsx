import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import {
	IconButton,
	ListItem,
	ListItemIcon,
	ListItemText,
} from '@mui/material';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useAppDispatch } from 'app/store/hooks';
import { closeDialog, openDialog } from '@fuse/core/FuseDialog/fuseDialogSlice';
import { useTranslation } from 'react-i18next';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useParams } from 'react-router';
import LoaderModal from '../modal/LoaderModel';
import { UpdateSortAPI } from './apis/Update-Sort-Api';
import { UpdateStatusAPI } from './apis/Update-Status-Api';
import { DeleteFieldAPI } from './apis/Delete-Field-Api';
import { GetFieldsAPI } from './apis/Get-Fields-Api';
import OnionConfirmBox from '../components/OnionConfirmBox';
import { OnionSwitch } from '../components/OnionSwitch';

enum ButtonState {
	Enabled = 0,
	Disabled = 1,
}

type DragDropType = {
	endPoint: string;
	loader?: boolean;
	loaderContent?: string;
	enableEdit?: boolean;
	onEditClick?: () => void;
	enableStatusSwitch?: boolean;
	enableDelete?: boolean;
	type: string;
	refresh?: boolean;
};

function OnionCustomFields({
	endPoint,
	loader,
	loaderContent,
	onEditClick,
	enableEdit,
	enableStatusSwitch,
	enableDelete,
	type,
	refresh = true
}: DragDropType) {
	const dispatch = useAppDispatch();
	const { t } = useTranslation();

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [items, setItems] = useState([]);

	useEffect(() => {
			getFieldData();
	}, [refresh]);

	const getFieldData = async () => {
		setIsLoading((prev) => !prev);
		try {
			const fieldData = await GetFieldsAPI({ data: endPoint , type});

			if (fieldData) {
				setItems(fieldData?.data || []);
				setIsLoading((prev) => !prev);
			}
		} catch (e) {
			dispatch(showMessage({ message: `${t('somethingWentWrong')}`, variant: 'error' }));
			setIsLoading((prev) => !prev);
		}
	};

	const updateSorting = async (data: any) => {
		setIsLoading((prev) => !prev);
		try {
			const _updateSorting = await UpdateSortAPI({ endPoint, data });

			if (_updateSorting.statusCode === 200) {
				dispatch(showMessage({ message: `${t('orderUpdated')}`, variant: 'success' }));
				getFieldData();
				setIsLoading((prev) => !prev);
			}
		} catch (err) {
			console.log(err);
			dispatch(showMessage({ message: `${t('somethingWentWrong')}`, variant: 'error' }));
			setIsLoading((prev) => !prev);
		}
	};

	const onDragEnd = (result) => {
		if (!result.destination) {
			return;
		}

		const newItems = Array.from(items);
		const [movedItem] = newItems.splice(result.source.index, 1);
		newItems.splice(result.destination.index, 0, movedItem);

		// Update pFOrder based on new position
		const updatedItems = newItems.map((item, index) => ({ ...item, pFOrder: index }));

		setItems(updatedItems);
		updateSorting(updatedItems);
	};

	const onStatusChange = async (id: string, currentStatus: number) => {
		const newStatus = currentStatus === 1 ? 0 : 1;
		const data = {
			id,
			status: newStatus,
			endPoint
		};
		setIsLoading((prev) => !prev);
		try {
			const statusUpdate = await UpdateStatusAPI({ data });

			if (statusUpdate.statusCode === 200) {
				dispatch(showMessage({ message: `${t('statusUpdated')}`, variant: 'success' }));
				getFieldData();
				setIsLoading((prev) => !prev);
			}
		} catch (err) {
			console.log(err);
			dispatch(showMessage({ message: `${t('somethingWentWrong')}`, variant: 'error' }));
			setIsLoading((prev) => !prev);
		}
	};

	const onDelete = async (id: string) => {
		const data = id;
		setIsLoading((prev) => !prev);
		try {
			const deleteResult = await DeleteFieldAPI({ data, endPoint });

			if (deleteResult.statusCode === 200) {
				dispatch(showMessage({ message: `${t('fieldDeleted')}`, variant: 'success' }));
				getFieldData();
				setIsLoading((prev) => !prev);
			} else {
				dispatch(showMessage({ message: `${t('somethingWentWrong')}`, variant: 'error' }));
				setIsLoading((prev) => !prev);
			}
		} catch (error) {
			console.log(error, 'err');
			dispatch(showMessage({ message: `${t('somethingWentWrong')}`, variant: 'error' }));
			setIsLoading((prev) => !prev);
		}
	};

	return (
		<>
			<DragDropContext onDragEnd={onDragEnd}>
				<Droppable droppableId="droppable">
					{(provided) => (
						<div
							{...provided.droppableProps}
							ref={provided.innerRef}
							className="w-full mt-5"
						>
							{(items !== null || undefined || '') &&
								items.map((item: any, index) => (
									<Draggable
										key={item._id}
										draggableId={item._id}
										index={index}
									>
										{(provided, snapshot) => (
											<ListItem
												className={clsx(
													snapshot.isDragging ? 'shadow-lg' : 'shadow',
													'ps-52 pe-20 py-8 group first:rounded-tl-lg first:rounded-tr-lg  last:rounded-ee-lg last:rounded-es-lg'
												)}
												sx={{ bgcolor: 'background.paper' }}
												ref={provided.innerRef}
												{...provided.draggableProps}
											>
												<div
													className=" absolute flex items-center justify-center inset-y-0 left-10 w-32 cursor-move md:group-hover:flex"
													{...provided.dragHandleProps}
												>
													<FuseSvgIcon
														sx={{ color: 'text.secondary' }}
														size={20}
													>
														material-outline:drag_indicator
													</FuseSvgIcon>
												</div>
												<ListItemText
													classes={{ root: 'm-0 w-32 max-w-32', primary: 'truncate' }}
													primary={index + 1}
												/>
												<ListItemText
													classes={{ root: 'm-0', primary: 'truncate' }}
													primary={item.pFLabel}
												/>
												{enableStatusSwitch && (
													<ListItemIcon
														className="me-10">
														<OnionSwitch
															disabled={item.pFDefault !== ButtonState.Enabled}
															checked={item.pFStatus === 1}
															onChange={() => onStatusChange(item._id, item.pFStatus)}
														/>
													</ListItemIcon>
												)}
												{enableEdit && (
													<ListItemIcon
														style={{ minWidth: '25px' }}
														className="me-10 cursor-pointer"
													>
														<IconButton
															disabled={item.pFDefault !== ButtonState.Enabled}
														>
															<FuseSvgIcon
																sx={{ color: 'text.disabled' }}
																size={20}
																onClick={onEditClick}
															>
																feather:edit
															</FuseSvgIcon>
														</IconButton>
													</ListItemIcon>
												)}
												{enableDelete && (
													<ListItemIcon
														style={{ minWidth: '25px' }}>
														<IconButton
															disabled={item.pFDefault !== ButtonState.Enabled}
														>
															<FuseSvgIcon
																sx={{ color: `${(item.pFDefault !== ButtonState.Enabled) ? 'text.disable' : 'text.primary'}` }}
																size={20}
																className='cursor-pointer'
																onClick={() =>
																	dispatch(
																		openDialog({
																			children: (
																				<OnionConfirmBox
																					title={t('confirmDelete')}
																					subTitle={t('onionCustomField_deleteConfirmContent')}
																					onCancel={() => dispatch(closeDialog())}
																					onConfirm={() => {
																						onDelete(item._id);
																						dispatch(closeDialog());
																					}}
																				/>
																			)
																		})
																	)
																}
															>
																feather:trash
															</FuseSvgIcon>
														</IconButton>
													</ListItemIcon>
												)}
											</ListItem>
										)}
									</Draggable>
								))}
							{provided.placeholder}
						</div>
					)}
				</Droppable>
			</DragDropContext>
			{loader && (
				<LoaderModal
					isLoading={isLoading}
					label={loaderContent}
				/>
			)}
		</>
	);
}

export default OnionCustomFields;
