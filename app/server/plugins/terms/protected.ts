import { consola } from 'consola'
import { Status as UnitStatus } from '~/types/geochronology'
import { Status as CompositionStatus } from '~/types/composition'


export default defineNitroPlugin(nitro => {
  nitro.hooks.hook('mongoose:init', async () => {
    const unit = await Geochronology.mongoose.model.findOne({ status: UnitStatus.PROTECTED })
    if (!unit) {
      try {
        await new Geochronology.mongoose.model({
          label: 'Unknown',
          status: UnitStatus.PROTECTED
        }).save({ validateBeforeSave: false })
        consola.info('Created "Unknown" geochronology unit.')
      } catch (err) {
        consola.error('Could not create "Unknown" geochronology unit:', err)
      }
    }

    
    try {
      const cf = await Composition.Fossil.mongoose.model.findOne({ label: 'Unknown' })
      if (!cf) {
        try {
          await new Composition.Fossil.mongoose.model({
            label: 'Unknown',
            status: CompositionStatus.PROTECTED
          }).save({ validateBeforeSave: false })
          consola.info('Created "Unknown" fossil composition.')
        } catch (err) {
          consola.error('Could not create "Unknown" fossil composition:', err)
        }
      } else if (cf.status !== CompositionStatus.PROTECTED) {
        cf.status = CompositionStatus.PROTECTED
        await cf.save({ validateBeforeSave: false })
        consola.info('Updated "Unknown" fossil composition to PROTECTED status.')
      }
    } catch (err) {
      consola.error('Could not create or update "Unknown" fossil composition:', err)
    }

    try {
      const rockComposition = await Composition.Rock.mongoose.model.findOne({ label: 'Unknown' })
      if (!rockComposition) {
      try {
        await new Composition.Rock.mongoose.model({
        label: 'Unknown',
        status: CompositionStatus.PROTECTED
        }).save({ validateBeforeSave: false })
        consola.info('Created "Unknown" rock composition.')
      } catch (err) {
        consola.error('Could not create "Unknown" rock composition:', err)
      }
      } else if (rockComposition.status !== CompositionStatus.PROTECTED) {
      rockComposition.status = CompositionStatus.PROTECTED
      await rockComposition.save({ validateBeforeSave: false })
      consola.info('Updated "Unknown" rock composition to PROTECTED status.')
      }
    } catch (err) {
      consola.error('Could not create or update "Unknown" rock composition:', err)
    }
  })
})