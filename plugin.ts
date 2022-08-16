/**
 * @name raider-io
 * @pluginURL https://raw.githubusercontent.com/rileyio/raider-io/master/plugin.ts
 * @repo rileyio/raider-io
 * @version 1.0.0
 */

import * as moment from 'moment'

import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ColorResolvable, EmbedBuilder, Message, SlashCommandBuilder } from 'discord.js'

import { CharacterProfile } from './character'
import { Plugin } from '../../src/objects/plugin'
import { RoutedInteraction } from '../../src/router/index'
import axios from 'axios'

const Covenant = {
  Kyrian: '<:Kyrian:1008063029830746254>',
  Necrolord: '<:Necrolord:1008063031168729098>',
  Nightfae: '<:Nightfae:1008063031944691772>',
  Venthyr: '<:Venthyr:1008063033051975680>'
}

export class RaiderIOPlugin extends Plugin {
  config = { baseURL: 'https://raider.io/api/v1' }

  constructor() {
    super()
    this.autoCheckForUpdate = false
  }

  public async onEnabled() {
    await this.bot.Router.addRoute({
      category: 'Plugin',
      controller: this.routeCommand,
      name: 'rio',
      permissions: {
        defaultEnabled: false,
        serverOnly: false
      },
      plugin: this,
      slash: new SlashCommandBuilder()
        .setName('rio')
        .setDescription('Raider.io')
        // * Character Profile
        .addSubcommand((subcommand) =>
          subcommand
            .setName('character-profile')
            .setDescription('Lookup Gear, Guild, Covenant, M+ and Raid Progression')
            .addStringOption((option) =>
              option
                .setName('region')
                .setDescription('Region')
                .setRequired(true)
                .setChoices({ name: 'US', value: 'us' }, { name: 'EU', value: 'eu' }, { name: 'TW', value: 'tw' }, { name: 'KR', value: 'kr' }, { name: 'CN', value: 'cn' })
            )
            .addStringOption((option) => option.setName('realm').setDescription('Server/Realm (Example: area-52)').setRequired(true))
            .addStringOption((option) => option.setName('name').setDescription('Character Name').setRequired(true))
        ),
      type: 'interaction'
    })
  }

  public async onDisabled() {
    await this.bot.Router.removeRoute('rio')
  }

  public async fetchCharacterProfile(plugin: RaiderIOPlugin, routed: RoutedInteraction) {
    const region = routed.interaction.options.get('region')?.value as string
    const realm = routed.interaction.options.get('realm')?.value as string
    const name = routed.interaction.options.get('name')?.value as string
    let url = `${plugin.config.baseURL}/characters/profile?region=${region}&realm=${realm}&name=${name}&fields=`
    url += 'gear,'
    url += 'guild,'
    url += 'covenant,'
    url += 'raid_progression,'
    url += 'raid_achievement_curve:castle-nathria:sanctum-of-domination:sepulcher-of-the-first-ones,'
    url += 'mythic_plus_scores_by_season:season-sl-4:season-sl-3:season-sl-2:season-sl-1'

    console.log(encodeURI(url))

    try {
      const { data } = await axios.get<CharacterProfile>(encodeURI(url))

      // Successful
      const title = `${Covenant[data.covenant.name]} ${data.name} :: ${data.class} - (${data.region}) ${data.realm}`
      const color = data.faction === 'alliance' ? 19091 : 9180694
      const characterLastUpdated = moment(data.last_crawled_at).fromNow()
      // let description = `` //`**Mythic Plus Score** \`(${data.mythic_plus_scores.all}\``

      // // Add M+ Scores Breakdown
      // if (data.mythic_plus_scores.tank) description += `\n- Tank \`${data.mythic_plus_scores.tank}\``
      // if (data.mythic_plus_scores.dps) description += `\n- DPS \`${data.mythic_plus_scores.dps}\``
      // if (data.mythic_plus_scores.healer) description += `\n- Healer \`${data.mythic_plus_scores.healer}\``

      const { head, neck, shoulder, back, chest, waist, shirt, wrist, hands, legs, feet, finger1, finger2, trinket1, trinket2, mainhand, offhand } = data.gear.items

      // Add Gear Listing
      let gear = ''
      gear += `\`${head.item_level}\` **Head** ${head.tier ? '`T`' : ''} ${head.name} ${head.gems.length ? '💎' : ''} ${head.enchant ? '✨' : ''}`
      neck ? (gear += `\n\`${neck.item_level}\` **Neck** ${neck.tier ? '`T`' : ''} ${neck.name} ${neck.gems.length ? '💎' : ''} ${neck.enchant ? '✨' : ''}`) : null
      shoulder
        ? (gear += `\n\`${shoulder.item_level}\` **Shoulder** ${shoulder.tier ? '`T`' : ''} ${shoulder.name} ${shoulder.gems.length ? '💎' : ''} ${shoulder.enchant ? '✨' : ''}`)
        : null
      back ? (gear += `\n\`${back.item_level}\` **Back** ${back.tier ? '`T`' : ''} ${back.name} ${back.gems.length ? '💎' : ''} ${back.enchant ? '✨' : ''}`) : null
      chest ? (gear += `\n\`${chest.item_level}\` **Chest** ${chest.tier ? '`T`' : ''} ${chest.name} ${chest.gems.length ? '💎' : ''} ${chest.enchant ? '✨' : ''}`) : null
      waist ? (gear += `\n\`${waist.item_level}\` **Waist** ${waist.tier ? '`T`' : ''} ${waist.name} ${waist.gems.length ? '💎' : ''} ${waist.enchant ? '✨' : ''}`) : null
      shirt ? (gear += `\n\`${shirt.item_level}\` **Shirt** ${shirt.tier ? '`T`' : ''} ${shirt.name} ${shirt.gems.length ? '💎' : ''} ${shirt.enchant ? '✨' : ''}`) : null
      wrist ? (gear += `\n\`${wrist.item_level}\` **Wrist** ${wrist.tier ? '`T`' : ''} ${wrist.name} ${wrist.gems.length ? '💎' : ''} ${wrist.enchant ? '✨' : ''}`) : null
      hands ? (gear += `\n\`${hands.item_level}\` **Hands** ${hands.tier ? '`T`' : ''} ${hands.name} ${hands.gems.length ? '💎' : ''} ${hands.enchant ? '✨' : ''}`) : null
      legs ? (gear += `\n\`${legs.item_level}\` **Legs** ${legs.tier ? '`T`' : ''} ${legs.name} ${legs.gems.length ? '💎' : ''} ${legs.enchant ? '✨' : ''}`) : null
      feet ? (gear += `\n\`${feet.item_level}\` **Feet** ${feet.tier ? '`T`' : ''} ${feet.name} ${feet.gems.length ? '💎' : ''} ${feet.enchant ? '✨' : ''}`) : null
      finger1
        ? (gear += `\n\`${finger1.item_level}\` **Ring 1** ${finger1.tier ? '`T`' : ''} ${finger1.name} ${finger1.gems.length ? '💎' : ''} ${finger1.enchant ? '✨' : ''}`)
        : null
      finger2
        ? (gear += `\n\`${finger2.item_level}\` **Ring 2** ${finger2.tier ? '`T`' : ''} ${finger2.name} ${finger2.gems.length ? '💎' : ''} ${finger2.enchant ? '✨' : ''}`)
        : null
      trinket1
        ? (gear += `\n\`${trinket1.item_level}\` **Trinket 1** ${trinket1.tier ? '`T`' : ''} ${trinket1.name} ${trinket1.gems.length ? '💎' : ''} ${trinket1.enchant ? '✨' : ''}`)
        : null
      trinket2
        ? (gear += `\n\`${trinket2.item_level}\` **Trinket 2** ${trinket2.tier ? '`T`' : ''} ${trinket2.name} ${trinket2.gems.length ? '💎' : ''} ${trinket2.enchant ? '✨' : ''}`)
        : null
      mainhand
        ? (gear += `\n\`${mainhand.item_level}\` **MH** ${mainhand.tier ? '`T`' : ''} ${mainhand.name} ${mainhand.gems.length ? '💎' : ''} ${mainhand.enchant ? '✨' : ''}`)
        : null
      offhand ? (gear += `\n\`${offhand.item_level}\` **OH** ${offhand.tier ? '`T`' : ''} ${offhand.name} ${offhand.gems.length ? '💎' : ''} ${offhand.enchant ? '✨' : ''}`) : null

      gear += `\n\n T Is Tier Gear`
      gear += `\n 💎 Has Gem`
      gear += `\n ✨ Has Enchant`

      let mPlus = ''
      const sls1 = data.mythic_plus_scores_by_season.find((s) => s.season === 'season-sl-1')
      const sls2 = data.mythic_plus_scores_by_season.find((s) => s.season === 'season-sl-2')
      const sls3 = data.mythic_plus_scores_by_season.find((s) => s.season === 'season-sl-3')
      const sls4 = data.mythic_plus_scores_by_season.find((s) => s.season === 'season-sl-4')

      if (sls4) {
        mPlus += `**SL S4** \`${sls4.scores.all}\``
        if (sls4.scores.tank) mPlus += `\n- Tank \`${sls4.scores.tank}\``
        if (sls4.scores.healer) mPlus += `\n- Healer \`${sls4.scores.healer}\``
        if (sls4.scores.dps) mPlus += `\n- DPS \`${sls4.scores.dps}\``
      }
      if (sls3) {
        mPlus += `\n\n**SL S3** \`${sls3.scores.all}\``
        if (sls3.scores.tank) mPlus += `\n- Tank \`${sls3.scores.tank}\``
        if (sls3.scores.healer) mPlus += `\n- Healer \`${sls3.scores.healer}\``
        if (sls3.scores.dps) mPlus += `\n- DPS \`${sls3.scores.dps}\``
      }
      if (sls2) {
        mPlus += `\n\n**SL S2** \`${sls2.scores.all}\``
        if (sls2.scores.tank) mPlus += `\n- Tank \`${sls2.scores.tank}\``
        if (sls2.scores.healer) mPlus += `\n- Healer \`${sls2.scores.healer}\``
        if (sls2.scores.dps) mPlus += `\n- DPS \`${sls2.scores.dps}\``
      }
      if (sls1) {
        mPlus += `\n\n**SL S1** \`${sls1.scores.all}\``
        if (sls1.scores.tank) mPlus += `\n- Tank \`${sls1.scores.tank}\``
        if (sls1.scores.healer) mPlus += `\n- Healer \`${sls1.scores.healer}\``
        if (sls1.scores.dps) mPlus += `\n- DPS \`${sls1.scores.dps}\``
      }
      // if (data.mythic_plus_scores.dps) description += `\n- DPS \`${data.mythic_plus_scores.dps}\``
      // if (data.mythic_plus_scores.healer) description += `\n- Healer \`${data.mythic_plus_scores.healer}\``

      let raid = ''
      const fcn = data.raid_progression['fated-castle-nathria']
      const fsod = data.raid_progression['fated-sanctum-of-domination']
      const fsofo = data.raid_progression['fated-sepulcher-of-the-first-ones']
      const cn = data.raid_progression['castle-nathria']
      const sod = data.raid_progression['sanctum-of-domination']
      const sofo = data.raid_progression['sepulcher-of-the-first-ones']

      const curveCN = data.raid_achievement_curve.find((r) => r.raid === 'castle-nathria')
      const curveSoD = data.raid_achievement_curve.find((r) => r.raid === 'sanctum-of-domination')
      const curveSoFO = data.raid_achievement_curve.find((r) => r.raid === 'sepulcher-of-the-first-ones')

      raid += `**\`[Fated]\` Sepulcher of the First Ones**`
      raid += `\nMythic ${fsofo.mythic_bosses_killed}/${fsofo.total_bosses}`
      raid += `\nHeroic ${fsofo.heroic_bosses_killed}/${fsofo.total_bosses}`
      raid += `\nNormal ${fsofo.normal_bosses_killed}/${fsofo.total_bosses}`

      raid += `\n\n**\`[Fated]\` Sanctum of Domination**`
      raid += `\nMythic ${fsod.mythic_bosses_killed}/${fsod.total_bosses}`
      raid += `\nHeroic ${fsod.heroic_bosses_killed}/${fsod.total_bosses}`
      raid += `\nNormal ${fsod.normal_bosses_killed}/${fsod.total_bosses}`

      raid += `\n\n**\`[Fated]\` Castle Nathria**`
      raid += `\nMythic ${fcn.mythic_bosses_killed}/${fcn.total_bosses}`
      raid += `\nHeroic ${fcn.heroic_bosses_killed}/${fcn.total_bosses}`
      raid += `\nNormal ${fcn.normal_bosses_killed}/${fcn.total_bosses}`

      raid += `\n\n**Sepulcher of the First Ones** ${curveSoFO ? (curveSoFO.aotc ? '`[AOTC]`' : '') : ''} ${curveSoFO ? (curveSoFO.cutting_edge ? '`[CE]`' : '') : ''}`
      raid += `\nMythic ${sofo.mythic_bosses_killed}/${sofo.total_bosses} ${curveSoFO?.cutting_edge ? '`' + (curveSoFO?.cutting_edge).substring(0, 10) + '`' : ''}`
      raid += `\nHeroic ${sofo.heroic_bosses_killed}/${sofo.total_bosses} ${curveSoFO?.aotc ? '`' + (curveSoFO?.aotc).substring(0, 10) + '`' : ''}`
      raid += `\nNormal ${sofo.normal_bosses_killed}/${sofo.total_bosses}`

      raid += `\n\n**Sanctum of Domination** ${curveSoD ? (curveSoD.aotc ? '`[AOTC]`' : '') : ''} ${curveSoD ? (curveSoD.cutting_edge ? '`[CE]`' : '') : ''}`
      raid += `\nMythic ${sod.mythic_bosses_killed}/${sod.total_bosses} ${curveSoD?.cutting_edge ? '`' + (curveSoD?.cutting_edge).substring(0, 10) + '`' : ''}`
      raid += `\nHeroic ${sod.heroic_bosses_killed}/${sod.total_bosses} ${curveSoD?.aotc ? '`' + (curveSoD?.aotc).substring(0, 10) + '`' : ''}`
      raid += `\nNormal ${sod.normal_bosses_killed}/${sod.total_bosses}`

      raid += `\n\n**Castle Nathria** ${curveCN ? (curveCN.aotc ? '`[AOTC]`' : '') : ''} ${curveCN ? (curveCN.cutting_edge ? '`[CE]`' : '') : ''}`
      raid += `\nMythic ${cn.mythic_bosses_killed}/${cn.total_bosses} ${curveCN?.cutting_edge ? '`' + (curveCN?.cutting_edge).substring(0, 10) + '`' : ''}`
      raid += `\nHeroic ${cn.heroic_bosses_killed}/${cn.total_bosses} ${curveCN?.aotc ? '`' + (curveCN?.aotc).substring(0, 10) + '`' : ''}`
      raid += `\nNormal ${cn.normal_bosses_killed}/${cn.total_bosses}`

      // Display options
      const outputOptions = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(new ButtonBuilder().setCustomId('gear').setLabel('Gear').setStyle(ButtonStyle.Secondary))
        .addComponents(new ButtonBuilder().setCustomId('mplus').setLabel('M+').setStyle(ButtonStyle.Secondary))
        .addComponents(new ButtonBuilder().setCustomId('raid').setLabel('Raid Prog').setStyle(ButtonStyle.Secondary))

      const completeOptions = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(new ButtonBuilder().setCustomId('public').setLabel('Make Public').setStyle(ButtonStyle.Danger))
        .addComponents(new ButtonBuilder().setCustomId('end').setLabel('Done').setStyle(ButtonStyle.Primary))

      // Collector to recieve interaction (With 5m timeout)]
      console.log('Collector Started!')

      // Standard components to display on all active collector messages
      const components = [outputOptions, completeOptions]
      // The last message replied
      let lastMsg: EmbedBuilder
      // The public message posted
      let publicMsg: Message<boolean>

      const collector = routed.interaction.channel?.createMessageComponentCollector({ time: 5 * (60 * 1000) })
      collector?.on('collect', async (i: ButtonInteraction) => {
        // Enable Make Public button now
        completeOptions.components[0].setDisabled(false)

        console.log('collector event', i.customId, `character: ${data.name}, realm: ${data.realm}, region: ${data.region}`)

        // Output Button Responses
        if (i.customId === 'gear')
          lastMsg = plugin.buttonInteractionReply(color, title, data.thumbnail_url, data.profile_url, characterLastUpdated, routed.routerStats.user, {
            name: `Gear \`${data.gear.item_level_equipped}\`ilv`,
            value: gear
          })

        if (i.customId === 'mplus')
          lastMsg = plugin.buttonInteractionReply(color, title, data.thumbnail_url, data.profile_url, characterLastUpdated, routed.routerStats.user, {
            name: `M+ ${sls4 ? `\`${sls4.scores.all}\`` : ''}`,
            value: mPlus
          })

        if (i.customId === 'raid')
          lastMsg = plugin.buttonInteractionReply(color, title, data.thumbnail_url, data.profile_url, characterLastUpdated, routed.routerStats.user, {
            name: 'Raid Progress',
            value: raid
          })

        // If the requestor makes the post public
        if (i.customId === 'public') {
          await i.update({
            components: [],
            embeds: [new EmbedBuilder().setDescription('Reposted Publicly')]
          })

          if (routed.interaction.channel) publicMsg = await routed.interaction.channel.send({ embeds: [lastMsg] })
          collector.stop('stopped')
        }

        // When stopped
        if (i.customId === 'end') {
          await i.update({
            components: [],
            embeds: publicMsg ? [] : [lastMsg]
          })
          collector.stop('stopped')
        }

        // Update Public -or- Private message
        if (i.customId !== 'end' && lastMsg)
          if (publicMsg) await publicMsg.edit({ embeds: [lastMsg] })
          else
            await i.update({
              components,
              embeds: [lastMsg]
            })
      })

      collector?.on('end', async (collected, reason) => {
        if (reason && reason !== 'stopped') {
          routed.interaction.editReply({
            components: [],
            embeds: [lastMsg]
          })
        }
      })

      // Disable Make Public button for first post
      completeOptions.components[0].setDisabled(true)

      // First post with button options
      await routed.reply(
        {
          components
        },
        true
      )
    } catch (error) {
      if (error.response.status === 400 && error.response.data.message === 'Could not find requested character')
        return await routed.reply('Could not find requested character', true)
      return await routed.reply('Unknown Error', true)
    }
  }

  public buttonInteractionReply(
    color: ColorResolvable,
    title: string,
    thumbnail: string,
    profileURL: string,
    characterLastUpdated: string,
    requestor: string,
    fields: { name: string; value: string }
  ) {
    return new EmbedBuilder()
      .setColor(color)
      .setThumbnail(thumbnail)
      .setURL(profileURL)
      .setFooter({
        iconURL: 'https://cdn.discordapp.com/app-icons/526039977247899649/41251d23f9bea07f51e895bc3c5c0b6d.png',
        text: `Last Updated: ${characterLastUpdated} :: Requested By ${requestor} :: Retrieved by Kiera`
      })
      .setTitle(title)
      .setTimestamp(Date.now())
      .addFields(fields)
  }

  public async routeCommand(plugin: RaiderIOPlugin, routed: RoutedInteraction) {
    const subCommand = routed.options?.getSubcommand() as 'character-profile'

    // Character Lookup
    if (subCommand === 'character-profile') return await plugin.fetchCharacterProfile(plugin, routed)
  }
}

export default function () {
  return new RaiderIOPlugin()
}
