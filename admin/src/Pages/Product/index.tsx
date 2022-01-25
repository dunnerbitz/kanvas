import useAxios from 'axios-hooks';
import styled from '@emotion/styled';
import FlexSpacer from '../../components/FlexSpacer';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CardMedia, Skeleton, Stack, Theme } from '@mui/material';
import { Typography } from '../../components/Typography';
import { INft } from '../../Interfaces/artwork';
import { useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ICategory } from '../../Interfaces/category';
import CircularProgress from '../../components/CircularProgress';
import { Button } from 'react-admin';

export interface ProductPageProps {
    theme?: Theme;
    nftsInCart: INft[];
    setNftsInCart: Function;
    listCart: Function;
}

 

const StyledStack = styled(Stack)`
    overflow: hidden;
    width: 100vw;
    max-width: 100rem;
    align-items: center;
    margin-bottom: 4rem;
`;

const StyledMetadataStack = styled(Stack)`
    min-width: 30%;
    max-width: 30%;

    @media (max-width: 874px) {
        max-width: 100%;
    }

    @media (min-width: 1440px) {
        /* width: 30%; */
        height: auto;
    }
`;

const StyledCardMedia = styled(CardMedia) <{ component?: string; alt: string }>`
    object-fit: contain;
    max-height: 75vh;
    /* min-height: 35rem; */

    @media (max-width: 874px) {
        min-height: 0;
        max-height: 100% !important;
    }

    @media (min-width: 1440px) {
        /* width: 70%; */
        /* height: auto; */
    }
`;

const StyledWrapperIcon = styled.div<{ theme?: Theme }>`
    border-radius: 2rem;
    margin: 0 !important;
    height: 2.5rem;
    width: 2.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    transition: scale 0.2s;

    :hover {
        cursor: pointer;
        scale: 1.075;
    }

    :active {
        cursor: pointer;
        scale: 0.98;
    }
`;

const StyledFullscreenIcon = styled(FullscreenIcon) <{ theme?: Theme }>`
    margin: 0 !important;
    height: 1.8rem;
    width: 1.8rem;
    color: #9771ff;
`;

const WrapperFullScreen = styled.div<{ open: boolean }>`
    visibility: visivble;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    position: fixed;
    z-index: 20;

    transition: visibility 0.3s;
`;

const FullScreenView = styled.div<{ theme?: Theme; open: boolean }>`
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 21;
    opacity: 1 !important;
    transition: opacity 0.4s;
`;

const StyledImage = styled.img<{ open: boolean }>`
    max-height: 90vh;
    max-width: 90vw;
    opacity: ${(props) => (props.open ? '1 !important' : 0)};
    z-index: 22;
    object-fit: contain;
    height: 100%;
    width: 100%;
    transition: opacity 0.4s;
    border-radius: 1rem;
`;

interface IProductParam {
    id: string;
}

export const ProductPage: FC<ProductPageProps> = ({ ...props }) => {
    const { t } = useTranslation(['translation']);

    const history = useHistory();
    const { id } = useParams<IProductParam>();

    const [nftResponse, getNft] = useAxios(
        {
            url: process.env.REACT_APP_API_SERVER_BASE_URL + `/nfts/${id}`,
            method: 'POST',
        },
        { manual: true },
    );

    const [addToCartResponse, addToCart] = useAxios(
        process.env.REACT_APP_API_SERVER_BASE_URL + `/user/cart/add/`,
        { manual: true },
    );

    const [comfortLoader, setComfortLoader] = useState<boolean>(true);
    const [fullScreenView, setFullScreenView] = useState<boolean>(false);

    const handleAddToBasket = () => {
        if (nftResponse.data) {
            addToCart({
                url:
                    process.env.REACT_APP_API_SERVER_BASE_URL +
                    `/users/cart/add/` +
                    nftResponse.data.id.toString(),
                method: 'POST',
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                        'Kanvas - Bearer',
                    )}`,
                },
            })
                .then((res) => {
                    if (res.status === 201) {
                        props.listCart();
                    }
                })
                .catch((err) => {
                    toast.error(
                        err.response?.data?.message ?? 'An error occured',
                    );
                });
        }
    };

    const [launchTime, setLaunchTime] = useState<number>();

    const nagivateTo = (pathname: string) => {
        history.push(pathname);
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        const comfortTrigger = setTimeout(() => {
            getNft();
            setComfortLoader(false);
        }, 800);
    }, []);

    useEffect(() => {
        if (nftResponse.data) {
            setLaunchTime(
                new Date(nftResponse.data.launchAt * 1000).getTime() -
                new Date().getTime(),
            );
        }
        if (nftResponse.error) {
        }
    }, [nftResponse]);

    useEffect(() => {
        if (nftResponse.data) {
            setTimeout(() => {
                setLaunchTime(
                    new Date(nftResponse.data.launchAt! * 1000).getTime() -
                    new Date().getTime(),
                );
            }, 1000);
        }
    }, [launchTime]);

    return (
        <>
            <WrapperFullScreen open={fullScreenView}>
                <StyledImage
                    src={nftResponse.data?.dataUri}
                    alt="random"
                    onClick={fullScreenView
                        ? () => { setFullScreenView(false); document.body.style.overflow = ''; }
                        : () => { }
                    }
                    open={fullScreenView}
                />
                <FullScreenView open={fullScreenView}></FullScreenView>
            </WrapperFullScreen>
            <StyledStack
                direction="column"
                spacing={3}
                sx={{
                    position: 'relative',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '45rem',
                }}
            >
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={5}
                    sx={{
                        width: '100%',
                        minHeight: '20rem',
                        marginTop: '7rem',
                        justifyContent: 'center',
                    }}
                >
                    {nftResponse.loading || comfortLoader ? (
                        <Box
                            sx={{
                                height: '75vh',
                                width: '100%',
                                minHeight: 400,
                                maxHeight: 1000,
                                maxWidth: 1000,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <CircularProgress height={2} />
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'flex-end',
                            }}
                        >
                            <StyledCardMedia
                                component="img"
                                image={nftResponse.data?.dataUri}
                                alt="random"
                            />
                            <StyledWrapperIcon
                                onClick={
                                    !fullScreenView
                                        ? () => { setFullScreenView(true); document.body.style.overflow = 'hidden'; }
                                        : () => { }
                                }
                            >
                                <StyledFullscreenIcon />
                            </StyledWrapperIcon>
                        </Box>
                    )}

                    <StyledMetadataStack
                        direction="column"
                        sx={{ position: 'relative' }}
                    >
                        {/* Headline */}
                        <FlexSpacer />

                        <Typography size="h4" weight="SemiBold">
                            {nftResponse.loading || comfortLoader ? (
                                <Skeleton width="15rem" height="2rem" />
                            ) : (
                                nftResponse.data?.creator
                            )}
                        </Typography>

                        <Typography size="h2" weight="SemiBold">
                            {nftResponse.loading || comfortLoader ? (
                                <Skeleton width="10rem" height="2rem" />
                            ) : (
                                nftResponse.data?.name
                            )}
                        </Typography>

                        <Typography
                            size="body"
                            weight="SemiBold"
                            sx={{ pt: 4 }}
                            color="#757575"
                        >
                            {nftResponse.loading || comfortLoader ? (
                                <Skeleton width="10rem" height="2rem" />
                            ) : (
                                t('product.description.part_2')
                            )}
                        </Typography>
                        <Typography
                            size="h5"
                            weight="Light"
                            sx={{ pt: 2, mb: 1 }}
                        >
                            {nftResponse.loading || comfortLoader ? (
                                <Stack direction="column">
                                    <Skeleton width="40rem" height="1rem" />
                                    <Skeleton width="40rem" height="1rem" />
                                    <Skeleton width="40rem" height="1rem" />
                                    <Skeleton width="10rem" height="1rem" />
                                </Stack>
                            ) : (
                                nftResponse.data?.description ??
                                'No description provided'
                            )}
                        </Typography>
                        {launchTime && launchTime > 0 && (
                            <>
                                <Typography
                                    size="body1"
                                    weight="SemiBold"
                                    sx={{ pt: 4 }}
                                    color="#757575"
                                >
                                    {nftResponse.loading ||
                                        (comfortLoader &&
                                            (!launchTime || launchTime < 0))
                                        ? undefined
                                        : t('product.description.part_3')}
                                </Typography>

                                <Typography
                                    size="h5"
                                    weight="Light"
                                    sx={{ pt: 2, mb: 1 }}
                                >
                                    {nftResponse.loading || comfortLoader ? (
                                        <Skeleton width="8rem" height="2rem" />
                                    ) : launchTime && launchTime > 0 ? (
                                        `${new Date(
                                            launchTime,
                                        ).getDate()} days - ${new Date(
                                            launchTime,
                                        ).getHours()} : ${new Date(
                                            launchTime,
                                        ).getMinutes()} : ${new Date(
                                            launchTime,
                                        ).getSeconds()}`
                                    ) : (
                                        'NFT has been dropped'
                                    )}
                                </Typography>
                            </>
                        )}
                        <Typography
                            size="body1"
                            weight="SemiBold"
                            sx={{ pt: 4 }}
                            color="#757575"
                        >
                            {nftResponse.loading || comfortLoader
                                ? undefined
                                : t('product.description.categories')}
                        </Typography>

                        <Typography
                            size="h5"
                            weight="Light"
                            sx={{ pt: 2, mb: 1 }}
                        >
                            {nftResponse.loading ||
                                comfortLoader ? undefined : (
                                <>
                                    {nftResponse.data?.categories.map(
                                        (category: ICategory) => (
                                            <Typography
                                                size="body1"
                                                weight="Medium"
                                                type="link"
                                                onClick={() =>
                                                    nagivateTo(
                                                        `/store?categories=${category.id}`,
                                                    )
                                                }
                                            >
                                                {nftResponse.data?.categories.indexOf(
                                                    category,
                                                ) === 0
                                                    ? category.name
                                                    : `, ${category.name}`}
                                            </Typography>
                                        ),
                                    )}
                                </>
                            )}
                        </Typography>

                        <Stack direction="row" spacing={10}>
                            <Stack direction="column">
                                <Typography
                                    size="body1"
                                    weight="SemiBold"
                                    sx={{ pt: 4 }}
                                    color="#757575"
                                >
                                    {nftResponse.loading || comfortLoader
                                        ? undefined
                                        : t('product.description.editions')}
                                </Typography>

                                <Typography
                                    size="h5"
                                    weight="SemiBold"
                                    sx={{ pt: 2, mb: 1 }}
                                >
                                    {nftResponse.loading || comfortLoader
                                        ? undefined
                                        : nftResponse.data?.editionsAvailable +
                                        '/' +
                                        nftResponse.data?.editionsSize}
                                </Typography>
                            </Stack>
                            <Stack direction="column">
                                <Typography
                                    size="body1"
                                    weight="SemiBold"
                                    sx={{ pt: 4 }}
                                    color="#757575"
                                >
                                    {nftResponse.loading || comfortLoader
                                        ? undefined
                                        : t('product.description.price')}
                                </Typography>

                                <Typography
                                    size="h5"
                                    weight="SemiBold"
                                    sx={{ pt: 2, mb: 1 }}
                                >
                                    {nftResponse.loading ||
                                        comfortLoader ? undefined : (
                                        <>{nftResponse.data?.price} ꜩ</>
                                    )}
                                </Typography>
                            </Stack>
                        </Stack>

                        <Button
                            size="medium"
                            onClick={() => handleAddToBasket()}
                            // label={
                            //     launchTime! > 0
                            //         ? 'Not dropped yet'
                            //         : props.nftsInCart.filter(
                            //             (nft) =>
                            //                 Number(nft.id) ===
                            //                 nftResponse.data?.id,
                            //         ).length > 0
                            //             ? 'Already in cart'
                            //             : t('product.button_1')
                            // }
                            label="Not dropped yet"
                            // disabled={
                            //     nftResponse.loading ||
                            //     comfortLoader ||
                            //     props.nftsInCart.filter(
                            //         (nft) =>
                            //             Number(nft.id) === nftResponse.data?.id,
                            //     ).length > 0 ||
                            //     Number(nftResponse.data?.editionsAvailable) ===
                            //     0 ||
                            //     launchTime! > 0
                            // }
                            style={{ marginTop: '3rem !important' }}
                        />
                    </StyledMetadataStack>
                </Stack>
            </StyledStack>
        </>
    );
};

export default ProductPage;
