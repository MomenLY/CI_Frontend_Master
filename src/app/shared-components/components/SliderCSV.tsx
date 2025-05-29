import Slider from "react-slick";
import Box from "@mui/material/Box";
import CardMedia from "@mui/material/CardMedia";
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import { expoLayoutImageUrl } from "src/utils/urlHelper";
import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import OnionSubHeader from "./OnionSubHeader";

interface LayoutSelectorProps {
  control: any;
  setValue: (name: string, value: any) => void;
  expLayoutwatch?: string
  isDisabled?: boolean
}

const SliderCsv = ({ control, setValue, expLayoutwatch, isDisabled = false }: LayoutSelectorProps) => {
  const { t } = useTranslation("expoManagement");

  const layouts = Array.from({ length: 8 }, (_, index) => ({
    title: `${t("layout")} ${index + 1}`,
    image: expoLayoutImageUrl(`layout_${index + 1}_image.webp`),
    value: `layout_${index + 1}`,
  }));

  const settings = {
    dots: false,
    arrows: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: parseInt(expLayoutwatch?.match(/\d+/)[0], 10) - 1 || 0,
    centerMode: true,
  };

  return (
    <>
    <Box className="flex justify-between items-center pt-[8px] mb-[24px]">
    <OnionSubHeader
        title={t("select_layout_title")}
        subTitle={t("select_layout_helper_text")}
      />
    </Box>
    <Controller
      name="expLayoutId"
      control={control}
      // disabled={true}
      render={({ field }) => (
        <RadioGroup
          {...field}
          aria-labelledby="demo-radio-buttons-group-label"
          sx={{ display: "block !important" }}
          className="p-0"
        >
          <div className="slider-container overflow-hidden p-0">
            <Slider {...settings} className="p-0">
              {layouts.map((layout) => (
                <div key={layout.value}>
                  <CardMedia
                    sx={{ height: 175 }}
                    image={layout.image}
                    title={layout.title}
                  />
                  <FormControlLabel
                    value={layout.value}
                    control={<Radio disabled={isDisabled} />} 
                    label={layout.title}
                  />
                </div>
              ))}
            </Slider>
          </div>
        </RadioGroup>
      )}
    />
  </>
  );
}

export default SliderCsv;
