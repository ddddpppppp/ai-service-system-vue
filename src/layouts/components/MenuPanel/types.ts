import type { Menu } from '#/global'
import type { InjectionKey } from 'vue'

export interface MenuItem {
  index: string
  indexPath: string[]
  active?: boolean
}

export interface MenuProps {
  menu: Menu.recordRaw[]
  value: string
  mode?: 'horizontal' | 'vertical'
  collapse?: boolean
  showCollapseName?: boolean
  rounded?: boolean
  direction?: 'ltr' | 'rtl'
}

export interface MenuInjection {
  props: MenuProps
  items: Record<string, MenuItem>
  subMenus: Record<string, MenuItem>
  activeIndex: MenuProps['value']
  openedMenus: string[]
  mouseInMenu: string[]
  openMenu: (index: string) => void
  closeMenu: (index: string | string[]) => void
  handleMenuItemClick: (index: string) => void
  handleSubMenuClick: (index: string) => void
}

export const rootMenuInjectionKey = Symbol('rootMenu') as InjectionKey<MenuInjection>

export interface SubMenuProps {
  uniqueKey: string[]
  menu: Menu.recordRaw
  level?: number
}

export interface SubMenuItemProps {
  uniqueKey: string[]
  item: Menu.recordRaw
  level?: number
  subMenu?: boolean
}
