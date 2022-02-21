import styled from '@emotion/styled';
import Typography from '../../atoms/Typography';

import { FC } from 'react';
import { Stack, Slider, Theme, TextField } from '@mui/material';

interface PriceFilterProps {
    minRange: number;
    maxRange: number;
    range?: [number, number];
    setRange: Function;
    triggerPriceFilter: () => void;
    setFilterSliding: (input: boolean) => void;
}

const StyledTextField = styled(TextField)<{ theme?: Theme }>`
    outline: none;
    border-bottom: 1px solid #c4c4c4;

    :hover {
        margin-bottom: -1px !important;
        border-bottom: 2px solid #c4c4c4;
    }

    :focus {
        margin-bottom: -1px !important;
        border-bottom: 2px solid ${(props) => props.theme.palette.text.primary};
    }

    .MuiOutlinedInput-notchedOutline {
        border: none !important;

        :hover {
            border: none !important;
        }
    }

    transition: all 0.2s;
`;

const StyledSlider = styled(Slider)<{ theme?: Theme }>`
    margin: 0.8rem 3.33% !important;
    width: 90%;

    color: ${(props) => props.theme.palette.primary.contrastText};

    @media (min-width: 900px) {
        width: 95%;
        margin: 0.8rem !important;
    }

    .MuiSlider-valueLabel {
        background-color: transparent !important;
    }

    .MuiSlider-valueLabelCircle {
        display: none;
    }
`;

export const PriceFilter: FC<PriceFilterProps> = ({ ...props }) => {
    return (
        <Stack sx={{ width: '100%' }} spacing={3}>
            <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
                <StyledTextField
                    type="number"
                    aria-label="Number - input price range from"
                    value={props.range ? props.range[0] : props.minRange}
                    onChange={(e) =>
                        props.setRange((bonds: [number, number]) => [
                            Number(e.target.value),
                            bonds[1],
                        ])
                    }
                />
                <Typography
                    size="Subtitle1"
                    weight="Medium"
                    display="initial !important"
                    align="center"
                    color="#C4C4C4"
                    aria-label="separator"
                >
                    -
                </Typography>
                <StyledTextField
                    type="number"
                    aria-label="Number - input price range up to"
                    value={props.range ? props.range[1] : props.maxRange}
                    onChange={(e) =>
                        props.setRange((bonds: [number, number]) => [
                            bonds[0],
                            Number(e.target.value),
                        ])
                    }
                />
            </Stack>

            <StyledSlider
                draggable
                getAriaLabel={() => 'Price range filter'}
                value={props.range ?? [props.minRange, props.maxRange]}
                min={props.minRange}
                max={props.maxRange}
                onChange={(_, newValues) => {
                    props.setRange(newValues as [number, number]);
                }}
                onChangeCommitted={() => {
                    props.triggerPriceFilter();
                    props.setFilterSliding(false);
                }}
                valueLabelDisplay="auto"
                getAriaValueText={() => 'valuetext'}
            />
        </Stack>
    );
};
