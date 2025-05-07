import React, { useState } from "react";
import RegistrationHeader from "./RegistrationHeader";
import OnionCustomeSubTitle from "app/shared-components/components/OnionCustomeSubTitle";
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import OnionCustomRadioButton from "app/shared-components/components/OnionCustomRadioButton";
import { FormControl } from "@mui/base";
import { DatePicker } from "@mui/x-date-pickers";
import { z } from "zod";
import OnionCustomFields from "app/shared-components/onion-custom-fields/OnionCustomFields";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { useTranslation } from "react-i18next";

const defaultValues = {
  registration: true,
  minSeat: 50,
  maxSeat: 100,
  unlimitedSeatOption: false,
  registrationStartImmediatly: false,
  chooseDateToStart: true,
  DateToStart: "",
  acceptRegistrationUntilExpoStart: true,
  registrationCloseDate: true,
  chooseDays: 5,
  DateToEnd: "",
};

type RegistratonForm = {
  registration: boolean;
  minSeat: number;
  maxSeat: number;
  unlimitedSeatOption: boolean;
  registrationStartImmediatly: boolean;
  chooseDateToStart: boolean;
  DateToStart: string;
  acceptRegistrationUntilExpoStart: boolean;
  registrationCloseDate: boolean;
  chooseDays: number;
  DateToEnd: string;
};

function Registration() {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    expoRegistration: "enable",
    minSeat: 50,
    maxSeat: 100,
    unlimitedSeatOption: false,
    registrationStartDate: "immediate",
    customStartDate: null,
    registrationEndDate: "untilExpoStart",
    closeDaysBefore: 5,
    customEndDate: null,
  });

  const schema = z.object({
    registration: z.boolean(),
    minSeat: z.string().min(10, "minimum 10 seats should book"),
    maxSeat: z.string().min(100, "Maximum 100 seats is vailable"),
    unlimitedSeatOption: z.boolean(),
    registrationStartImmediatly: z.boolean(),
    chooseDateToStart: z.boolean(),
    acceptRegistrationUntilExpoStart: z.boolean(),
    registrationCloseDate: z.boolean(),
    chooseDays: z.string(),
    DateToEnd: z.string(),
  });

  const handleRadioChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleCheckboxChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.checked,
    });
  };

  const handleInputChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date,
    });
  };

  return (
    <div>
      <div className="mb-32">
        <RegistrationHeader />
      </div>

      <div className="mb-20">
        <div className="py-8 pt-0">
          <OnionCustomeSubTitle
            title="Expo Registration"
            subTitle="This section allows you to enable registration for your expo"
          />
        </div>
        <div className="py-10">
          <FormControl>
            <RadioGroup
              row
              name="expoRegistration"
              value={formData.expoRegistration}
              onChange={handleRadioChange}
            >
              <OnionCustomRadioButton value="enable" label="Enable" />
              <OnionCustomRadioButton value="disable" label="Disable" />
            </RadioGroup>
          </FormControl>
        </div>
      </div>

      <div className="mb-20">
        <div className="py-8 pt-0">
          <OnionCustomeSubTitle
            title="Registration Limit"
            subTitle="This section allows you to limit the number of registration"
          />
        </div>
        <div className="pt-16 pb-8">
          <Grid container spacing={3} className="sm:max-w-[80%]">
            {!formData.unlimitedSeatOption && (
              <>
                <Grid item xs={6}>
                  <TextField
                    type="number"
                    name="minSeat"
                    label="Min Seats"
                    value={formData.minSeat}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    type="number"
                    name="maxSeat"
                    label="Max Seats"
                    value={formData.maxSeat}
                    onChange={handleInputChange}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </div>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                name="unlimitedSeatOption"
                checked={formData.unlimitedSeatOption}
                onChange={handleCheckboxChange}
              />
            }
            label="Unlimited Seat Option"
          />
        </FormGroup>
      </div>

      <div className="mb-20">
        <div className="py-8 pt-0">
          <OnionCustomeSubTitle
            title="Expo Registration Start Date"
            subTitle="Manage Registration Start Date"
          />
        </div>
        <div className="pt-10 pb-12">
          <FormControl>
            <RadioGroup
              sx={{ flexDirection: "column" }}
              name="registrationStartDate"
              value={formData.registrationStartDate}
              onChange={handleRadioChange}
            >
              <OnionCustomRadioButton
                value="immediate"
                label="Start Immediately"
              />
              <OnionCustomRadioButton value="custom" label="Choose a Date" />
            </RadioGroup>
          </FormControl>
        </div>
        {formData.registrationStartDate === "custom" && (
          <DatePicker
            className="md:w-full md:max-w-[50%]"
            label="Registration Start Date & Time"
            value={formData.customStartDate}
            onChange={(date) => handleDateChange("customStartDate", date)}
          />
        )}
      </div>

      <div className="mb-20">
        <div className="py-8 pt-0">
          <OnionCustomeSubTitle
            title="Expo Registration End Date"
            subTitle="Manage Registration end date"
          />
        </div>
        <div className="my-10">
          <FormControl>
            <RadioGroup
              sx={{ flexDirection: "column" }}
              name="registrationEndDate"
              value={formData.registrationEndDate}
              onChange={handleRadioChange}
            >
              <OnionCustomRadioButton
                value="untilExpoStart"
                label="Accept registration until expo start"
              />
              <OnionCustomRadioButton
                value="closeBefore"
                label="Registration closes before"
              />
              <OnionCustomRadioButton
                value="customDate"
                label="Choose a date"
              />
            </RadioGroup>
          </FormControl>
        </div>
        {formData.registrationEndDate === "closeBefore" && (
          <div className="block py-10 md:max-w-[180px]">
            <TextField
              type="number"
              name="closeDaysBefore"
              label="Days"
              value={formData.closeDaysBefore}
              onChange={handleInputChange}
            />
          </div>
        )}
        {formData.registrationEndDate === "customDate" && (
          <DatePicker
            className="md:w-full md:max-w-[50%]"
            label="Registration End Date & Time"
            value={formData.customEndDate}
            onChange={(date) => handleDateChange("customEndDate", date)}
          />
        )}
      </div>
      {/* <OnionPageOverlay> */}
      <div className="mt-5 mb-24 flex flex-col md:flex-row w-full">
        <div className="py-8 pt-0">
          <OnionCustomeSubTitle
            title={t("profileFieldSettings")}
            subTitle="Please provide details about the information needed for
            registration purpose"
          />
        </div>
        <div className="flex w-full justify-center">
          <Button
            className="mx-4 rounded-[10px] font-medium uppercase"
            variant="contained"
            color="secondary"
            component={NavLinkAdapter}
            to={"new"}
          >
            <FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>

            <span className="sm:flex mx-4 ">Add</span>
          </Button>
        </div>
      </div>
      <div className="md:w-1/2 mt-36">
        <OnionCustomFields
          endPoint="profile-fields"
          loader
          enableStatusSwitch
          enableDelete
          type={"profile"}
          // refresh={state}
        />
      </div>
      {/* </OnionPageOverlay> */}
    </div>
  );
}

export default Registration;
