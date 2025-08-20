import { consola } from 'consola'
import { Status } from '~/types/geochronology'

export default defineNitroPlugin(nitro => {
  nitro.hooks.hook('mongoose:init', async () => {
    const term = await Geochronology.mongoose.model.findOne({ status: Status.PROTECTED })
    if (!term) {
      try {
        await new Geochronology.mongoose.model({
          label: 'Unknown',
          status: Status.PROTECTED
        }).save({ validateBeforeSave: false })
        consola.info('Created "Unknown" geochronology term.')
      } catch (err) {
        consola.error('Could not create "Unknown" geochronology term:', err)
      }
    }
  })
})