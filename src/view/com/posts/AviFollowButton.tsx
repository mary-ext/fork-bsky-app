import React from 'react'
import {View} from 'react-native'
import {AppBskyActorDefs, ModerationDecision} from '@atproto/api'
import {msg} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {useNavigation} from '@react-navigation/native'

import {NavigationProp} from '#/lib/routes/types'
import {sanitizeDisplayName} from '#/lib/strings/display-names'
import {useProfileShadow} from '#/state/cache/profile-shadow'
import {useSession} from '#/state/session'
import {
  DropdownItem,
  NativeDropdown,
} from '#/view/com/util/forms/NativeDropdown'
import * as Toast from '#/view/com/util/Toast'
import {atoms as a, select, useTheme} from '#/alf'
import {Button} from '#/components/Button'
import {useFollowMethods} from '#/components/hooks/useFollowMethods'
import {PlusSmall_Stroke2_Corner0_Rounded as Plus} from '#/components/icons/Plus'

export function AviFollowButton({
  author,
  moderation,
  children,
}: {
  author: AppBskyActorDefs.ProfileViewBasic
  moderation: ModerationDecision
  children: React.ReactNode
}) {
  const {_} = useLingui()
  const t = useTheme()
  const profile = useProfileShadow(author)
  const {follow} = useFollowMethods({
    profile: profile,
    logContext: 'AvatarButton',
  })
  const {currentAccount, hasSession} = useSession()
  const navigation = useNavigation<NavigationProp>()

  const name = sanitizeDisplayName(
    profile.displayName || profile.handle,
    moderation.ui('displayName'),
  )
  const isFollowing =
    profile.viewer?.following || profile.did === currentAccount?.did

  function onPress() {
    follow()
    Toast.show(_(msg`Following ${name}`))
  }

  const items: DropdownItem[] = [
    {
      label: _(msg`View profile`),
      onPress: () => {
        navigation.navigate('Profile', {name: profile.did})
      },
      icon: {
        ios: {
          name: 'arrow.up.right.square',
        },
        android: '',
        web: ['far', 'arrow-up-right-from-square'],
      },
    },
    {
      label: _(msg`Follow ${name}`),
      onPress: onPress,
      icon: {
        ios: {
          name: 'person.badge.plus',
        },
        android: '',
        web: ['far', 'user-plus'],
      },
    },
  ]

  return hasSession ? (
    <View style={a.relative}>
      {children}

      {!isFollowing && (
        <Button
          label={_(msg`Open ${name} profile shortcut menu`)}
          hitSlop={{
            top: 0,
            left: 0,
            right: 5,
            bottom: 5,
          }}
          style={[
            a.rounded_full,
            a.absolute,
            {
              height: 30,
              width: 30,
              bottom: -7,
              right: -7,
            },
          ]}>
          <NativeDropdown items={items}>
            <View
              style={[a.h_full, a.w_full, a.justify_center, a.align_center]}>
              <View
                style={[
                  a.rounded_full,
                  a.align_center,
                  select(t.name, {
                    light: t.atoms.bg_contrast_100,
                    dim: t.atoms.bg_contrast_100,
                    dark: t.atoms.bg_contrast_200,
                  }),
                  {
                    borderWidth: 1,
                    borderColor: t.atoms.bg.backgroundColor,
                  },
                ]}>
                <Plus
                  size="sm"
                  fill={
                    select(t.name, {
                      light: t.atoms.bg_contrast_600,
                      dim: t.atoms.bg_contrast_500,
                      dark: t.atoms.bg_contrast_600,
                    }).backgroundColor
                  }
                />
              </View>
            </View>
          </NativeDropdown>
        </Button>
      )}
    </View>
  ) : (
    children
  )
}
