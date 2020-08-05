import React from 'react';
import { Flex, Box, color, space, ChevronIcon, BoxProps } from '@blockstack/ui';
import Link from 'next/link';
import { useAppState } from '@common/hooks/use-app-state';
import { SIDEBAR_WIDTH } from '@common/constants';
// @ts-ignore
import nav from '@common/navigation.yaml';
import ArrowLeftIcon from 'mdi-react/ArrowLeftIcon';
import { getCategory, getTitle, slugify } from '@common/utils';
import { useRouter } from 'next/router';
import { getCapsizeStyles } from '@components/mdx/typography';
import { Text } from '@components/typography';
import { css } from '@styled-system/css';
import { SmartLink } from '@components/mdx';

const Wrapper: React.FC<BoxProps & { containerProps?: BoxProps }> = ({
  width = `${SIDEBAR_WIDTH}px`,
  containerProps,
  children,
  ...rest
}) => {
  return (
    <Box width={width} maxWidth={width} flexGrow={0} flexShrink={0} {...rest}>
      <Box
        position="sticky"
        width={width}
        maxHeight={`calc(100vh - 60px)`}
        overflow="auto"
        top={0}
        pt="64px"
        {...containerProps}
      >
        {children}
      </Box>
    </Box>
  );
};

const capitalize = s => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const convertToTitle = (path: string) =>
  !path ? null : path === '/' ? 'Home' : capitalize(path.replace('/', '').replace(/-/g, ' '));

const PageItem = React.forwardRef(
  (
    {
      isActive,
      color: _color = color('text-caption'),
      children,
      mb = space('base'),
      isTopLevel,
      ...props
    }: any,
    ref: any
  ) => {
    const typeStyles = isTopLevel ? getCapsizeStyles(16, 26) : getCapsizeStyles(14, 20);
    return (
      <SmartLink
        ref={ref}
        css={css({
          display: 'block',
          ...typeStyles,
          color: isActive ? color('accent') : isTopLevel ? color('text-title') : _color,
          mb: isTopLevel ? space('base-loose') : mb,
          ':hover': {
            color: isTopLevel ? color('accent') : color('text-title'),
          },
          textDecoration: 'none',
        })}
        {...props}
      >
        {children}
      </SmartLink>
    );
  }
);

const SectionTitle: React.FC<BoxProps> = ({ children, ...rest }) => (
  <Text
    css={css({
      display: 'block',
      ...getCapsizeStyles(16, 26),
      color: color('text-title'),
      ...rest,
    })}
  >
    {children}
  </Text>
);

const getRoutePath = (path, routes) => routes.find(route => route.path.endsWith(path));

const ChildPages = ({ items, handleClick }: any) => {
  const { routes } = useAppState();

  return items?.pages
    ? items?.pages?.map((page, key) => {
        if (page.external) {
          return (
            <Box mb={space('extra-tight')} key={key}>
              <PageItem as="a" href={page.external.href} target="_blank">
                {page.external.title}
              </PageItem>
            </Box>
          );
        }

        const path = page.pages
          ? `${page.path}${page.pages[0].path}`
          : items.path
          ? `/${slugify(items.path)}${page.path}`
          : page.path;

        const router = useRouter();

        const routePath = routes.find(route => route.path.endsWith(path));

        const route = getRoutePath(path, routes);

        return (
          <Box mb={space('extra-tight')} key={key}>
            <Link href={routePath.path} passHref>
              <PageItem
                isActive={router.pathname.endsWith(path)}
                onClick={page.pages ? () => handleClick(page) : undefined}
                as="a"
              >
                {items.usePageTitles ? getTitle(route) : convertToTitle(page.path)}
              </PageItem>
            </Link>
          </Box>
        );
      })
    : null;
};

const ChildSection: React.FC<BoxProps & { sections?: any }> = ({ sections, ...rest }) =>
  sections.map((section, key) => {
    return (
      <Box {...rest} key={key}>
        <SectionTitle
          letterSpacing="0.06rem"
          textTransform="uppercase"
          fontSize="12px"
          fontWeight={500}
          mb={space('base-loose')}
        >
          {section.title}
        </SectionTitle>
        <ChildPages items={section} />
      </Box>
    );
  });

const BackItem = props => (
  <Flex
    color={color('text-caption')}
    _hover={{
      cursor: 'pointer',
      color: color('text-title'),
    }}
    align="center"
    {...props}
  >
    <Box mr={space('extra-tight')}>
      <ArrowLeftIcon size="16px" />
    </Box>
    <PageItem textDecoration="none" mb={'0px'} color={'currentColor'}>
      Back
    </PageItem>
  </Flex>
);

const Navigation = () => {
  const { routes } = useAppState();
  const [selected, setSelected] = React.useState<any | undefined>({
    type: 'default',
    items: nav.sections,
    selected: undefined,
  });

  const router = useRouter();

  React.useEffect(() => {
    let currentSection = selected.items;

    nav.sections.forEach(section => {
      section.pages.forEach(page => {
        if (page.pages) {
          const pagesFound = page.pages.find(_page => {
            return router.pathname.endsWith(`${page.path}${_page.path}`);
          });
          const sectionsFound = page?.sections?.find(_section => {
            return _section.pages.find(_page => {
              return router.pathname.endsWith(`${page.path}${_page.path}`);
            });
          });
          if (pagesFound || sectionsFound) {
            currentSection = page;
          }
        } else {
          return router.pathname.endsWith(page.path);
        }
      });
    });

    if (selected.items !== currentSection) {
      setSelected({ type: 'page', items: currentSection });
    }
  }, [router.pathname]);

  const handleClick = (page: any) => {
    if (page.pages) {
      setSelected({
        type: 'page',
        items: page,
      });
    }
  };

  const handleBack = () =>
    setSelected({
      type: 'default',
      items: nav.sections,
    });

  if (selected.type === 'page') {
    return (
      <Box>
        <BackItem onClick={handleBack} mb={space('extra-loose')} />
        <Box mb={space('loose')}>
          <SectionTitle>{convertToTitle(selected.items.path)}</SectionTitle>
        </Box>
        <Box>
          {selected.items ? <ChildPages handleClick={handleClick} items={selected.items} /> : null}
          {selected.items?.sections ? (
            <ChildSection
              mt={space('extra-loose')}
              sections={selected.items?.sections?.map(section => ({
                ...section,
                path: selected.items.path,
              }))}
            />
          ) : null}
        </Box>
      </Box>
    );
  }

  if (selected.type === 'default') {
    const urlCategory = getCategory(router.pathname);
    return selected.items.map((section, i) => {
      return (
        <Box mb="40px" key={i}>
          {section.title ? (
            <Flex width="100%" align="center" mb={space('loose')}>
              <SectionTitle>{section.title}</SectionTitle>
              <Box color={color('text-caption')} size="16px" ml={space('extra-tight')}>
                <ChevronIcon direction="down" />
              </Box>
            </Flex>
          ) : null}
          {section.pages.map((page, key) => {
            const path = page.pages
              ? `${page.path}${page.pages[0].path}`
              : section?.title
              ? `/${slugify(section?.title)}${page.path}`
              : page.path;

            const route = getRoutePath(path, routes);

            return (
              <Box mb={space('extra-tight')} key={`${i}-${key}`}>
                <PageItem
                  href={!urlCategory ? path : !path.includes(urlCategory) && path}
                  isTopLevel={i === 0}
                  isActive={router.pathname.endsWith(path)}
                  onClick={() => handleClick(page)}
                >
                  {section.usePageTitles ? getTitle(route) : convertToTitle(page.path)}
                </PageItem>
              </Box>
            );
          })}
        </Box>
      );
    });
  }
};

export const SideNav: React.FC<BoxProps & { containerProps?: BoxProps }> = ({
  containerProps,
  ...rest
}) => {
  return (
    <Wrapper containerProps={containerProps} {...rest}>
      <Navigation />
    </Wrapper>
  );
};
