/**
 * @name raider-io
 * @pluginURL https://raw.githubusercontent.com/rileyio/raider-io/master/plugin.ts
 * @repo rileyio/raider-io
 * @version 2.0.1
 */

import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ColorResolvable, EmbedBuilder, Message, SlashCommandBuilder } from 'discord.js'
import { RouteConfiguration, Routed } from '../../src/router/index.ts'
import { fetchSeasonCutoffs, getMythicPlusScorePlacement } from './mythic-plus.ts'

import { CharacterProfile } from './character.ts'
import { Plugin } from '../../src/common/objects/plugin.ts'
import axios from 'axios'
import moment from 'moment'
import { realms } from './servers.ts'

// const Covenant = {
//   Kyrian: '<:Kyrian:1008063029830746254>',
//   Necrolord: '<:Necrolord:1008063031168729098>',
//   Nightfae: '<:Nightfae:1008063031944691772>',
//   Venthyr: '<:Venthyr:1008063033051975680>'
// }

const GroupRole = {
  DPS: '<:dps:1077246366599884870>',
  Healer: '<:healer:1077246367631675532>',
  Tank: '<:tank:1077246369783349309>'
}

export class RaiderIOPlugin extends Plugin {
  config = { baseURL: 'https://raider.io/api/v1' }
  routes = [
    new RouteConfiguration({
      autocomplete: {
        options: {
          realm: realms
        }
      },
      category: 'Plugin/Raider.IO',
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
            .addStringOption((option) => option.setName('realm').setDescription('Server/Realm (Example: Area 52)').setRequired(true).setAutocomplete(true))
            .addStringOption((option) => option.setName('name').setDescription('Character Name').setRequired(true))
        ),
      type: 'discord-chat-interaction'
    })
  ]

  constructor() {
    super()
    this.autoCheckForUpdate = false
  }

  // onEnabled = async () => {
  //   console.log('test')
  // }

  // onDisabled = async () => {
  //   await this.bot.Router.removeRoute('rio')
  // }

  public async fetchCharacterProfile(plugin: RaiderIOPlugin, routed: Routed<'discord-chat-interaction'>) {
    const region = routed.interaction.options.get('region')?.value as string
    const realm = routed.interaction.options.get('realm')?.value as string
    const name = routed.interaction.options.get('name')?.value as string
    let charURL = `${plugin.config.baseURL}/characters/profile?region=${region}&realm=${realm}&name=${name}&fields=`
    charURL += 'gear,'
    charURL += 'guild,'
    charURL += 'covenant,'
    charURL += 'raid_progression,'
    charURL += 'raid_achievement_curve:castle-nathria:sanctum-of-domination:sepulcher-of-the-first-ones:vault-of-the-incarnates:aberrus-the-shadowed-crucible,'
    charURL += 'mythic_plus_scores_by_season:season-df-2:season-df-1:season-sl-4:season-sl-3:season-sl-2:season-sl-1'

    console.log('Character URL:', encodeURI(charURL))

    try {
      await routed.interaction.deferReply({ ephemeral: true })
      const { data } = await axios.get<CharacterProfile>(encodeURI(charURL))

      // Build Embed
      const title = `${data.name} :: ${data.class} - (${data.region}) ${data.realm}`
      const color = data.faction === 'alliance' ? 19091 : 9180694
      const characterLastUpdated = moment(data.last_crawled_at).fromNow()

      // Gear from API
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

      gear += `\n\n \`T\` Is Tier Gear`
      gear += `\n 💎 Has Gem`
      gear += `\n ✨ Has Enchant`

      // Mythic Plus
      let mPlus = ''
      const sls1 = data.mythic_plus_scores_by_season.find((s) => s.season === 'season-sl-1')
      const sls2 = data.mythic_plus_scores_by_season.find((s) => s.season === 'season-sl-2')
      const sls3 = data.mythic_plus_scores_by_season.find((s) => s.season === 'season-sl-3')
      const sls4 = data.mythic_plus_scores_by_season.find((s) => s.season === 'season-sl-4')
      const dfs1 = data.mythic_plus_scores_by_season.find((s) => s.season === 'season-df-1')
      const dfs2 = data.mythic_plus_scores_by_season.find((s) => s.season === 'season-df-2')
      const seasonCutoffs = await fetchSeasonCutoffs(this.config.baseURL, region)
      const dfs1MythicPlusScorePlacement = undefined //seasonCutoffs && dfs1 ? getMythicPlusScorePlacement(seasonCutoffs, dfs1.scores.all) : null
      const dfs2MythicPlusScorePlacement = seasonCutoffs && dfs2 ? getMythicPlusScorePlacement(seasonCutoffs, dfs2.scores.all) : null

      // TODO: Create cache to not spam these old seasons constantly
      const sls4MythicPlusScorePlacement = false
      const sls3MythicPlusScorePlacement = false
      //const sls4MythicPlusScorePlacement = seasonCutoffs && sls4 ? getMythicPlusScorePlacement(seasonCutoffs, sls4.scores.all) : null
      //const sls3MythicPlusScorePlacement = seasonCutoffs && sls3 ? getMythicPlusScorePlacement(seasonCutoffs, sls3.scores.all) : null

      // Dragonflight Scores
      if (dfs2.scores.all) {
        if (dfs2MythicPlusScorePlacement) mPlus += `**DF S2** \`${dfs2.scores.all}\`${dfs2MythicPlusScorePlacement ? ` | **${dfs2MythicPlusScorePlacement}**` : ''}\n`
        else mPlus += `**DF S2** \`${dfs2.scores.all}\`\n`
        // Role Scores (s2)
        if (dfs2.scores.tank) mPlus += `${GroupRole.Tank} \`${dfs2.scores.tank}\``
        if (dfs2.scores.healer) mPlus += ` ${GroupRole.Healer} \`${dfs2.scores.healer}\``
        if (dfs2.scores.dps) mPlus += ` ${GroupRole.DPS} \`${dfs2.scores.dps}\``
      }
      if (dfs1.scores.all) {
        if (dfs1MythicPlusScorePlacement) mPlus += `**DF S1** \`${dfs1.scores.all}\`${dfs1MythicPlusScorePlacement ? ` | **${dfs1MythicPlusScorePlacement}**` : ''}\n`
        else mPlus += `\n\n**DF S1** \`${dfs1.scores.all}\`\n`
        // Role Scores (s1)
        if (dfs1.scores.tank) mPlus += `${GroupRole.Tank} \`${dfs1.scores.tank}\``
        if (dfs1.scores.healer) mPlus += ` ${GroupRole.Healer} \`${dfs1.scores.healer}\``
        if (dfs1.scores.dps) mPlus += ` ${GroupRole.DPS} \`${dfs1.scores.dps}\``
      }

      // Shadowlands Scores
      if (sls1 || sls2 || sls3 || sls4) mPlus += `\n\n**==== Shadowlands ====**`

      if (sls4.scores.all) {
        if (sls4MythicPlusScorePlacement) mPlus += `\n\n**SL S4** \`${sls4.scores.all}\ | **${sls4MythicPlusScorePlacement}**\n`
        else mPlus += `\n\n**SL S4** \`${sls4.scores.all}\`\n`
        // Role Scores
        if (sls4.scores.tank) mPlus += `${GroupRole.Tank} \`${sls4.scores.tank}\``
        if (sls4.scores.healer) mPlus += ` ${GroupRole.Healer} \`${sls4.scores.healer}\``
        if (sls4.scores.dps) mPlus += ` ${GroupRole.DPS} \`${sls4.scores.dps}\``
      }
      if (sls3.scores.all) {
        if (sls3MythicPlusScorePlacement) mPlus += `\n\n**SL S3** \`${sls3.scores.all}\` | **${sls3MythicPlusScorePlacement}**\n`
        else mPlus += `\n\n**SL S3** \`${sls3.scores.all}\`\n`
        // Role Scores
        if (sls3.scores.tank) mPlus += `${GroupRole.Tank} \`${sls3.scores.tank}\``
        if (sls3.scores.healer) mPlus += ` ${GroupRole.Healer} \`${sls3.scores.healer}\``
        if (sls3.scores.dps) mPlus += ` ${GroupRole.DPS} \`${sls3.scores.dps}\``
      }
      // if (sls2.scores.all) {
      //   mPlus += `\n\n**SL S2** \`${sls2.scores.all}\`\n`
      //   // Role Scores
      //   if (sls2.scores.tank) mPlus += `${GroupRole.Tank} \`${sls2.scores.tank}\``
      //   if (sls2.scores.healer) mPlus += ` ${GroupRole.Healer} \`${sls2.scores.healer}\``
      //   if (sls2.scores.dps) mPlus += ` ${GroupRole.DPS} \`${sls2.scores.dps}\``
      // }
      // if (sls1.scores.all) {
      //   mPlus += `\n\n**SL S1** \`${sls1.scores.all}\`\n`
      //   // Role Scores
      //   if (sls1.scores.tank) mPlus += `${GroupRole.Tank} \`${sls1.scores.tank}\``
      //   if (sls1.scores.healer) mPlus += ` ${GroupRole.Healer} \`${sls1.scores.healer}\``
      //   if (sls1.scores.dps) mPlus += ` ${GroupRole.DPS} \`${sls1.scores.dps}\``
      // }

      // Page M+ Footer
      mPlus += '\n\n'
      mPlus += `[RIO](https://raider.io/characters/${region}/${realm}/${name}) ● `
      mPlus += `[Armory](https://worldofwarcraft.blizzard.com/en-us/character/${region}/${realm}/${name}) ● `
      mPlus += `[WCL](https://www.warcraftlogs.com/character/${region}/${realm}/${name})`

      // if (data.mythic_plus_scores.dps) description += `\n- DPS \`${data.mythic_plus_scores.dps}\``
      // if (data.mythic_plus_scores.healer) description += `\n- Healer \`${data.mythic_plus_scores.healer}\``

      let raid = ''
      const atsc = data.raid_progression['aberrus-the-shadowed-crucible']
      const voi = data.raid_progression['vault-of-the-incarnates']

      // const curveCN = data.raid_achievement_curve.find((r) => r.raid === 'castle-nathria')
      // const curveSoD = data.raid_achievement_curve.find((r) => r.raid === 'sanctum-of-domination')
      // const curveSoFO = data.raid_achievement_curve.find((r) => r.raid === 'sepulcher-of-the-first-ones')
      const curveATSC = data.raid_achievement_curve.find((r) => r.raid === 'aberrus-the-shadowed-crucible')
      const curveVoI = data.raid_achievement_curve.find((r) => r.raid === 'vault-of-the-incarnates')

      if (atsc) {
        raid += `\n\n**Aberrus the Shadowed Crucible** ${curveATSC ? (curveATSC.aotc ? '`[AOTC]`' : '') : ''} ${curveATSC ? (curveATSC.cutting_edge ? '`[CE]`' : '') : ''}`
        raid += `\nMythic ${atsc.mythic_bosses_killed}/${atsc.total_bosses} ${curveATSC?.cutting_edge ? '`' + (curveATSC?.cutting_edge).substring(0, 10) + '`' : ''}`
        raid += `\nHeroic ${atsc.heroic_bosses_killed}/${atsc.total_bosses} ${curveATSC?.aotc ? '`' + (curveATSC?.aotc).substring(0, 10) + '`' : ''}`
        raid += `\nNormal ${atsc.normal_bosses_killed}/${atsc.total_bosses}`
      }

      if (voi) {
        raid += `\n\n**Vault of the Incarnates** ${curveVoI ? (curveVoI.aotc ? '`[AOTC]`' : '') : ''} ${curveVoI ? (curveVoI.cutting_edge ? '`[CE]`' : '') : ''}`
        raid += `\nMythic ${voi.mythic_bosses_killed}/${voi.total_bosses} ${curveVoI?.cutting_edge ? '`' + (curveVoI?.cutting_edge).substring(0, 10) + '`' : ''}`
        raid += `\nHeroic ${voi.heroic_bosses_killed}/${voi.total_bosses} ${curveVoI?.aotc ? '`' + (curveVoI?.aotc).substring(0, 10) + '`' : ''}`
        raid += `\nNormal ${voi.normal_bosses_killed}/${voi.total_bosses}`
      }
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

      const collector = routed.channel?.createMessageComponentCollector({
        filter: (i) => i.user.id === routed.interaction.user.id && i.message.interaction.id === routed.interaction.id,
        time: 5 * (60 * 1000)
      })
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
            name: `M+ by Season`,
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

          if (routed.interaction.channel) publicMsg = await routed.channel.send({ embeds: [lastMsg] })
          collector.stop('stopped')
        }

        // When stopped
        if (i.customId === 'end') {
          // At least 1 button has been pressed
          if (lastMsg)
            await i.update({
              components: [],
              embeds: publicMsg ? [] : [lastMsg]
            })
          // Condition for when no other buttons are pressed
          else
            await i.update({
              components: [],
              content: 'Done'
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
          // If there is an embed, update it with the last message
          await routed.interaction.editReply({
            components: [],
            content: 'Looks like you took too long to respond.',
            embeds: lastMsg ? [lastMsg] : undefined
          })
        }
      })

      // Disable Make Public button for first post
      completeOptions.components[0].setDisabled(true)

      // First post with button options
      return await routed.interaction.editReply({
        components
      })
    } catch (error) {
      console.log('Error', error)
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
        text: `Last Updated (rio): ${characterLastUpdated} :: Requested By ${requestor} :: Retrieved by Kiera`
      })
      .setTitle(title)
      .setTimestamp(Date.now())
      .addFields(fields)
  }

  public async routeCommand(plugin: RaiderIOPlugin, routed: Routed<'discord-chat-interaction'>) {
    const subCommand = routed.options?.getSubcommand() as 'character-profile'

    // Character Lookup
    if (subCommand === 'character-profile') return await plugin.fetchCharacterProfile(plugin, routed)
  }
}

export default function () {
  return new RaiderIOPlugin()
}
