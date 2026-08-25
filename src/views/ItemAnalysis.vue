<template>
  <div class="analysis-page">
    <!-- ==========================================
         PAGE HEADER
    =========================================== -->
    <div class="page-header">
      <div>
        <button
          class="back-btn"
          type="button"
          @click="$router.back()"
        >
          ← Back
        </button>
        <h1>Competency Based Item Analysis</h1>
        <p>
          {{ exam.title }}
          <span v-if="exam.course">
            • {{ exam.course }}
          </span>
        </p>
      </div>
      <div class="export-actions">

  <button
    class="export-btn"
    type="button"
    @click="exportExcel"
  >
    📥 Export Excel
  </button>

  <button
    class="pdf-export-btn"
    type="button"
    :disabled="exportingPdf"
    @click="exportPdf"
  >
    {{
      exportingPdf
        ? 'Generating PDF...'
        : '🖨 Export PDF'
    }}
  </button>

</div>
    </div>
    <!-- ==========================================
         LOADING
    =========================================== -->
    <div
      v-if="loading"
      class="state-card"
    >
      <div class="loader"></div>
      <h2>Loading Item Analysis</h2>
      <p>
        Calculating examination performance...
      </p>
    </div>
    <!-- ==========================================
         ERROR
    =========================================== -->
    <div
      v-else-if="errorMessage"
      class="state-card error-card"
    >
      <div class="state-icon">
        ⚠
      </div>
      <h2>Unable to Load Analysis</h2>
      <p>
        {{ errorMessage }}
      </p>
      <button
        class="retry-btn"
        type="button"
        @click="fetchItemAnalysis"
      >
        Try Again
      </button>
    </div>
    <template v-else>
      <!-- ==========================================
           REPORT INFORMATION
      =========================================== -->
      <section class="report-information">
        <div class="exam-information">
          <div class="exam-details">
            <div>
              <small>Grade</small>
              <strong>
                {{ exam.grade || '—' }}
              </strong>
            </div>
            <div>
              <small>Section</small>
              <strong>
                {{ exam.section || '—' }}
              </strong>
            </div>
            <div>
              <small>Subject</small>
              <strong>
                {{ exam.course || '—' }}
              </strong>
            </div>
          </div>
          <div class="exam-statistics">
            <div>
              <span>Total Items</span>
              <strong>{{ totalQuestions }}</strong>
            </div>
            <div>
              <span>Total Examinees</span>
              <strong>{{ totalExaminees }}</strong>
            </div>
            <div>
              <span>Mean</span>
              <strong>{{ meanScore }}</strong>
            </div>
            <div>
              <span>MPS</span>
              <strong>{{ mps }}%</strong>
            </div>
            <div>
              <span>SD</span>
              <strong>{{ standardDeviation }}</strong>
            </div>
            <div>
              <span>PL</span>
              <strong>{{ performanceLevel }}</strong>
            </div>
          </div>
        </div>
      </section>
      <!-- ==========================================
           SUMMARY CARDS
      =========================================== -->
      <div class="summary-grid">
        <div class="summary-card">
          <small>Total Items</small>
          <h2>{{ totalQuestions }}</h2>
        </div>
        <div class="summary-card">
          <small>Mastered</small>
          <h2>
            {{ masteryCount('Mastered') }}
          </h2>
        </div>
        <div class="summary-card">
          <small>For Revision</small>
          <h2>{{ reviseCount }}</h2>
        </div>
        <div class="summary-card">
          <small>For Rejection</small>
          <h2>{{ rejectCount }}</h2>
        </div>
      </div>
      <!-- ==========================================
           FILTERS
      =========================================== -->
      <section class="filter-panel">
        <div class="filter-buttons">
          <button
            v-for="filter in filters"
            :key="filter"
            type="button"
            :class="{
              active: selectedFilter === filter
            }"
            @click="selectedFilter = filter"
          >
            {{ filter }}
          </button>
        </div>
        <div class="filter-controls">
          <input
            v-model="search"
            type="text"
            placeholder="Search competency or question..."
          >
          <select v-model="sortBy">
            <option value="number">
              Item Number
            </option>
            <option value="lowest">
              Lowest Percentage
            </option>
            <option value="highest">
              Highest Percentage
            </option>
          </select>
        </div>
      </section>
      <!-- ==========================================
           MAIN ANALYSIS TABLE
      =========================================== -->
      <section class="table-card">
        <div class="section-heading">
          <div>
            <h2>
              Item Analysis
            </h2>
            <p>
              Performance of every examination item
              according to competency.
            </p>
          </div>
        </div>
        <div class="table-wrapper">
          <table class="analysis-table">
            <thead>
              <tr>
                <th class="competency-heading">
                  Competencies
                </th>
                <th>
                  Item No.
                </th>
                <th>
                  No. of Correct Response
                </th>
                <th>
                  Percentage
                </th>
                <th>
                  Interpretation
                </th>
                <th>
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody>
              <template
                v-for="group in groupedItems"
                :key="group.competency"
              >
                <tr
                  v-for="(item, index) in group.items"
                  :key="item.id ?? `${group.competency}-${item.number}`"
                >
                  <!-- COMPETENCY -->
                  <td
                    v-if="index === 0"
                    :rowspan="group.items.length"
                    class="competency-cell"
                  >
                    {{ group.competency }}
                  </td>
                  <!-- ITEM NUMBER -->
                  <td class="center-cell item-number">
                    {{ item.number }}
                  </td>
                  <!-- CORRECT -->
                  <td class="center-cell">
                    {{ item.correct }}
                  </td>
                  <!-- PERCENTAGE -->
                  <td class="center-cell">
                    <strong>
                      {{ item.percentage }}%
                    </strong>
                  </td>
                  <!-- INTERPRETATION -->
                  <td class="center-cell">
                    <span
                      class="mastery-badge"
                      :class="item.masteryClass"
                    >
                      {{ item.masteryLevel }}
                    </span>
                  </td>
                  <!-- REMARK -->
                  <td class="center-cell">
                    <span
                      class="remarks-badge"
                      :class="item.remarksClass"
                    >
                      {{ item.remarks }}
                    </span>
                  </td>
                </tr>
              </template>
              <tr v-if="filteredItems.length === 0">
                <td
                  colspan="6"
                  class="empty-table"
                >
                  No items found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <!-- ==========================================
           MASTERY SUMMARY
      =========================================== -->
      <section class="summary-table-card">

        <div class="section-heading">

          <div>
            <h2>Summary</h2>

            <p>
              Test items grouped according to
              mastery level.
            </p>
          </div>

        </div>


        <div class="table-wrapper">

          <table class="mastery-summary-table">

            <thead>

              <tr>

                <th>
                  Mastery Level
                </th>

                <th>
                  Test Item
                </th>

                <th>
                  Remarks
                </th>

              </tr>

            </thead>


            <tbody>

              <tr
                v-for="summary in masterySummary"
                :key="summary.level"
              >

                <td class="mastery-name-cell">

                  <span
                    class="mastery-badge"
                    :class="summary.className"
                  >
                    {{ summary.level }}
                  </span>

                </td>


                <td class="summary-items">
                  {{ summary.itemNumbers }}
                </td>


                <td class="summary-description">
                  {{ summary.description }}
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </section>


      <!-- ==========================================
           LEGEND
      =========================================== -->
      <section class="legend-card">

        <h3>Legend</h3>

        <div class="legend-grid">

          <div class="legend-column">

            <div class="legend-item">
              <span class="legend-box mastered"></span>
              Mastered
            </div>

            <div class="legend-item">
              <span class="legend-box approximating"></span>
              Approximating Mastery
            </div>

            <div class="legend-item">
              <span class="legend-box moving"></span>
              Moving Towards Mastery
            </div>

            <div class="legend-item">
              <span class="legend-box average"></span>
              Average Mastery
            </div>

            <div class="legend-item">
              <span class="legend-box low"></span>
              Low Mastery
            </div>

          </div>


          <div class="legend-column">

            <div class="legend-item">
              <span class="legend-box retain-revise"></span>
              Retain or Revise
            </div>

            <div class="legend-item">
              <span class="legend-box retain"></span>
              Retain
            </div>

            <div class="legend-item">
              <span class="legend-box revise"></span>
              Revise
            </div>

            <div class="legend-item">
              <span class="legend-box reject"></span>
              Reject
            </div>

          </div>

        </div>

      </section>

    </template>

  </div>
</template>


<script setup lang="ts">

import {
  ref,
  computed,
  onMounted
} from 'vue'

import {
  useRoute
} from 'vue-router'

import api from '../services/api'

import * as XLSX from 'xlsx'


/* =====================================================
   TYPES
===================================================== */

interface ExamData {
  id: number
  title: string
  course: string
  grade: string
  section: string
  sd?: number | string | null
  pl?: number | string | null
}


interface RawItem {
  id?: number

  number?: number

  question?: string

  type?: string

  correct?: number

  wrong?: number

  total?: number

  successRate?: number

  percentage?: number

  competency?: string

  discrimination?: number | string

  commonWrongAnswer?: string

  [key: string]: any
}


interface AnalyzedItem extends RawItem {

  number: number

  correct: number

  total: number

  percentage: number

  competency: string

  masteryLevel: string

  masteryClass: string

  remarks: string

  remarksClass: string
}


/* =====================================================
   ROUTE
===================================================== */

const route = useRoute()
const exportingPdf = ref(false)

/* =====================================================
   STATE
===================================================== */

const loading =
  ref(true)


const errorMessage =
  ref('')


const search =
  ref('')


const selectedFilter =
  ref('All Items')


const sortBy =
  ref('number')


const exam =
  ref<ExamData>({

    id: 0,

    title: '',

    course: '',

    grade: '',

    section: '',

    sd: null,

    pl: null

  })


const items =
  ref<RawItem[]>([])


/* =====================================================
   FILTERS
===================================================== */

const filters = [

  'All Items',

  'Mastered',

  'Approximating Mastery',

  'Moving Towards Mastery',

  'Average Mastery',

  'Low Mastery'

]


/* =====================================================
   FETCH ITEM ANALYSIS
===================================================== */

async function fetchItemAnalysis() {

  loading.value = true

  errorMessage.value = ''

  try {

    const examId =
      route.params.id


    /*
     * Load exam information.
     */
    const examResponse =
      await api.get(
        `/exams/${examId}`
      )


    const examData =
      examResponse.data?.data || {}


    exam.value = {

      id:
        Number(
          examData.id || examId
        ),

      title:
        examData.title ||
        'Examination',

      course:
        examData.course ||
        examData.subject ||
        '',

      grade:
        examData.grade ||
        examData.grade_level ||
        '',

      section:
        examData.section ||
        '',

      sd:
        examData.sd ??
        examData.standard_deviation ??
        null,

      pl:
        examData.pl ??
        examData.performance_level ??
        null

    }


    /*
     * Load item analysis.
     */
    const response =
      await api.get(
        `/exams/${examId}/item-analysis`
      )


    const responseData =
      response.data?.data


    /*
     * Support:
     *
     * data: [...]
     *
     * OR
     *
     * data: {
     *   items: [...],
     *   summary: {...}
     * }
     */
    if (Array.isArray(responseData)) {

      items.value =
        responseData

    }

    else {

      items.value =
        Array.isArray(
          responseData?.items
        )
          ? responseData.items
          : []


      /*
       * If backend already provides
       * statistical values, use them.
       */
      if (responseData?.summary) {

        exam.value.sd =
          responseData.summary.sd ??
          responseData.summary
            .standard_deviation ??
          exam.value.sd


        exam.value.pl =
          responseData.summary.pl ??
          responseData.summary
            .performance_level ??
          exam.value.pl

      }

    }

  }

  catch (error) {

    console.error(
      'ITEM ANALYSIS ERROR:',
      error
    )

    errorMessage.value =
      'Failed to load the item analysis.'

  }

  finally {

    loading.value = false

  }

}


/* =====================================================
   ANALYZE ITEMS
===================================================== */

const analyzedItems =
  computed<AnalyzedItem[]>(() => {

    return items.value.map(
      (
        item,
        index
      ) => {

        /*
         * Total examinees.
         */
        const total =
          Number(
            item.total || 0
          )


        /*
         * Correct responses.
         */
        const correct =
          Number(
            item.correct || 0
          )


        /*
         * Prefer backend percentage.
         *
         * Otherwise calculate:
         *
         * correct / total × 100
         */
        let percentage =
          Number(
            item.successRate ??
            item.percentage ??
            0
          )


        if (
          (
            item.successRate === undefined &&
            item.percentage === undefined
          )

          &&

          total > 0
        ) {

          percentage =
            (
              correct /
              total
            ) * 100

        }


        /*
         * Round percentage.
         */
        percentage =
          Math.round(
            percentage * 100
          ) / 100


        let masteryLevel = ''

        let masteryClass = ''

        let remarks = ''

        let remarksClass = ''


        /*
         * =====================================
         * AGENCY MASTERY CLASSIFICATION
         * =====================================
         */


        /*
         * 96 - 100
         */
        if (
          percentage >= 96
        ) {

          masteryLevel =
            'Mastered'

          masteryClass =
            'mastered'

          remarks =
            'Retain or Revise'

          remarksClass =
            'retain-revise'

        }


        /*
         * 86 - 95
         */
        else if (
          percentage >= 86
        ) {

          masteryLevel =
            'Approximating Mastery'

          masteryClass =
            'approximating'

          remarks =
            'Retain'

          remarksClass =
            'retain'

        }


        /*
         * 66 - 85
         */
        else if (
          percentage >= 66
        ) {

          masteryLevel =
            'Moving Towards Mastery'

          masteryClass =
            'moving'

          remarks =
            'Retain'

          remarksClass =
            'retain'

        }


        /*
         * 35 - 65
         */
        else if (
          percentage >= 35
        ) {

          masteryLevel =
            'Average Mastery'

          masteryClass =
            'average'

          remarks =
            'Revise'

          remarksClass =
            'revise'

        }


        /*
         * 0 - 34
         */
        else {

          masteryLevel =
            'Low Mastery'

          masteryClass =
            'low'

          remarks =
            'Reject'

          remarksClass =
            'reject'

        }


        return {

          ...item,

          number:
            Number(
              item.number
            ) ||
            index + 1,

          correct,

          total,

          percentage,

          competency:
            String(
              item.competency ||
              item.competency_name ||
              item.learning_competency ||
              'Unassigned Competency'
            ),

          masteryLevel,

          masteryClass,

          remarks,

          remarksClass

        }

      }

    )

  })


/* =====================================================
   TOTAL QUESTIONS
===================================================== */

const totalQuestions =
  computed(
    () =>
      analyzedItems.value.length
  )


/* =====================================================
   TOTAL EXAMINEES
===================================================== */

const totalExaminees =
  computed(() => {

    if (
      analyzedItems.value.length === 0
    ) {

      return 0

    }


    return Math.max(

      ...analyzedItems.value.map(
        item =>
          Number(
            item.total || 0
          )
      ),

      0

    )

  })


/* =====================================================
   MEAN SCORE
===================================================== */

const meanScore =
  computed(() => {

    const examinees =
      totalExaminees.value


    if (
      examinees <= 0
    ) {

      return '0.00'

    }


    /*
     * Total correct responses across
     * every question.
     */
    const totalCorrect =
      analyzedItems.value.reduce(

        (
          sum,
          item
        ) =>

          sum +
          Number(
            item.correct || 0
          ),

        0

      )


    /*
     * Mean test score per student.
     */
    return (
      totalCorrect /
      examinees
    ).toFixed(2)

  })


/* =====================================================
   MEAN PERCENTAGE SCORE
===================================================== */

const mps =
  computed(() => {

    if (
      totalQuestions.value <= 0
    ) {

      return '0.00'

    }


    const mean =
      Number(
        meanScore.value
      )


    return (

      (
        mean /
        totalQuestions.value
      )

      *

      100

    ).toFixed(2)

  })


/* =====================================================
   SD
===================================================== */

/*
 * Standard deviation cannot be calculated
 * correctly using only per-item totals.
 *
 * The backend should send the actual SD
 * based on individual student scores.
 */
const standardDeviation =
  computed(() => {

    if (
      exam.value.sd === null ||
      exam.value.sd === undefined ||
      exam.value.sd === ''
    ) {

      return '—'

    }


    const value =
      Number(
        exam.value.sd
      )


    if (
      Number.isNaN(value)
    ) {

      return String(
        exam.value.sd
      )

    }


    return value.toFixed(2)

  })


/* =====================================================
   PERFORMANCE LEVEL
===================================================== */

/*
 * Use backend value because the exact
 * institutional PL formula should come
 * from the agency.
 */
const performanceLevel =
  computed(() => {

    if (
      exam.value.pl === null ||
      exam.value.pl === undefined ||
      exam.value.pl === ''
    ) {

      return '—'

    }


    const value =
      Number(
        exam.value.pl
      )


    if (
      Number.isNaN(value)
    ) {

      return String(
        exam.value.pl
      )

    }


    return value.toFixed(2)

  })


/* =====================================================
   MASTERY COUNT
===================================================== */

function masteryCount(
  mastery: string
) {

  return analyzedItems.value
    .filter(
      item =>
        item.masteryLevel ===
        mastery
    )
    .length

}


/* =====================================================
   REVISE COUNT
===================================================== */

const reviseCount =
  computed(() => {

    return analyzedItems.value
      .filter(

        item =>

          item.remarks ===
            'Revise'

          ||

          item.remarks ===
            'Retain or Revise'

      )
      .length

  })


/* =====================================================
   REJECT COUNT
===================================================== */

const rejectCount =
  computed(() => {

    return analyzedItems.value
      .filter(
        item =>
          item.remarks ===
          'Reject'
      )
      .length

  })


/* =====================================================
   FILTERED ITEMS
===================================================== */

const filteredItems =
  computed<AnalyzedItem[]>(() => {

    let result =
      [
        ...analyzedItems.value
      ]


    /*
     * Filter by mastery.
     */
    if (
      selectedFilter.value !==
      'All Items'
    ) {

      result =
        result.filter(

          item =>

            item.masteryLevel ===
            selectedFilter.value

        )

    }


    /*
     * Search.
     */
    if (
      search.value.trim()
    ) {

      const keyword =
        search.value
          .trim()
          .toLowerCase()


      result =
        result.filter(
          item => {

            const competency =
              String(
                item.competency ||
                ''
              )
                .toLowerCase()


            const question =
              String(
                item.question ||
                ''
              )
                .toLowerCase()


            return (

              competency.includes(
                keyword
              )

              ||

              question.includes(
                keyword
              )

              ||

              String(
                item.number
              ).includes(
                keyword
              )

            )

          }
        )

    }


    /*
     * Sorting.
     */
    if (
      sortBy.value ===
      'lowest'
    ) {

      result.sort(
        (
          a,
          b
        ) =>
          a.percentage -
          b.percentage
      )

    }


    else if (
      sortBy.value ===
      'highest'
    ) {

      result.sort(
        (
          a,
          b
        ) =>
          b.percentage -
          a.percentage
      )

    }


    else {

      result.sort(
        (
          a,
          b
        ) =>
          a.number -
          b.number
      )

    }


    return result

  })


/* =====================================================
   GROUP BY COMPETENCY
===================================================== */
const groupedItems = computed(() => {
  const groups: Record<string, AnalyzedItem[]> = {}

  filteredItems.value.forEach((item) => {
    const competency =
      String(
        item.competency ||
        'Unassigned Competency'
      ).trim()

    if (!groups[competency]) {
      groups[competency] = []
    }

    groups[competency].push(item)
  })

  return Object.entries(groups).map(
    ([competency, items]) => ({
      competency,
      items: items.sort(
        (a, b) =>
          a.number - b.number
      )
    })
  )
})


/* =====================================================
   MASTERY SUMMARY
===================================================== */

const masterySummary =
  computed(() => {

    const definitions = [

      {

        level:
          'Mastered',

        className:
          'mastered',

        description:
          'Students have demonstrated a thorough understanding of the competency and can consistently apply the required knowledge and skills with little or no assistance.'

      },


      {

        level:
          'Approximating Mastery',

        className:
          'approximating',

        description:
          'Students have achieved a high level of understanding of the competency, with only minor misconceptions or errors that can be addressed through brief reinforcement.'

      },


      {

        level:
          'Moving Towards Mastery',

        className:
          'moving',

        description:
          'Students show a satisfactory understanding of the competency but still require additional practice and reinforcement to attain full mastery.'

      },


      {

        level:
          'Average Mastery',

        className:
          'average',

        description:
          'Students have only a partial understanding of the competency. Significant gaps in knowledge and skills are evident, requiring re-teaching and targeted interventions.'

      },


      {

        level:
          'Low Mastery',

        className:
          'low',

        description:
          'Students have not yet developed the essential knowledge and skills related to the competency. Intensive remediation and focused instructional support are needed before progressing to more advanced learning.'

      }

    ]


    return definitions.map(
      definition => {

        const matches =
          analyzedItems.value
            .filter(

              item =>

                item.masteryLevel ===
                definition.level

            )
            .sort(
              (
                a,
                b
              ) =>
                a.number -
                b.number
            )


        return {

          ...definition,

          count:
            matches.length,

          itemNumbers:
            matches.length

              ?

              matches
                .map(
                  item =>
                    item.number
                )
                .join(', ')

              :

              '—'

        }

      }

    )

  })


/* =====================================================
   EXPORT EXCEL
===================================================== */

function exportExcel() {

  if (
    analyzedItems.value.length === 0
  ) {

    alert(
      'There is no item analysis to export.'
    )

    return

  }


  /*
   * =========================================
   * MAIN ANALYSIS SHEET
   * =========================================
   */

  const analysisRows:
    any[][] = []


  /*
   * Report heading.
   */
  analysisRows.push(
    [
      'COMPETENCY BASED ITEM ANALYSIS'
    ]
  )


  analysisRows.push(
    [
      exam.value.title
    ]
  )


  analysisRows.push(
    []
  )


  analysisRows.push(
    [
      'GRADE:',
      exam.value.grade || '—',

      '',

      'TOTAL ITEMS:',
      totalQuestions.value
    ]
  )


  analysisRows.push(
    [
      'SECTION:',
      exam.value.section || '—',

      '',

      'MEAN:',
      meanScore.value
    ]
  )


  analysisRows.push(
    [
      'SUBJECT:',
      exam.value.course || '—',

      '',

      'SD:',
      standardDeviation.value
    ]
  )


  analysisRows.push(
    [
      '',

      '',

      '',

      'MPS:',
      `${mps.value}%`
    ]
  )


  analysisRows.push(
    [
      '',

      '',

      '',

      'PL:',
      performanceLevel.value
    ]
  )


  analysisRows.push(
    [
      '',

      '',

      '',

      'TOTAL ENROLLMENT:',
      totalExaminees.value
    ]
  )


  analysisRows.push(
    []
  )


  /*
   * Table headings.
   */
  analysisRows.push(
    [
      'COMPETENCIES',

      'ITEM NO.',

      'NO. OF CORRECT RESPONSE',

      'PERCENTAGE',

      'INTERPRETATION',

      'REMARKS'
    ]
  )


  /*
   * Table rows.
   */
  analyzedItems.value
    .sort(
      (
        a,
        b
      ) =>
        a.number -
        b.number
    )
    .forEach(
      item => {

        analysisRows.push(
          [

            item.competency,

            item.number,

            item.correct,

            item.percentage,

            item.masteryLevel,

            item.remarks

          ]
        )

      }

    )


  const analysisSheet =
    XLSX.utils
      .aoa_to_sheet(
        analysisRows
      )


  analysisSheet['!cols'] = [

    {
      wch: 50
    },

    {
      wch: 12
    },

    {
      wch: 24
    },

    {
      wch: 15
    },

    {
      wch: 30
    },

    {
      wch: 20
    }

  ]


  /*
   * Merge report headings.
   */
  analysisSheet['!merges'] = [

    {
      s: {
        r: 0,
        c: 0
      },

      e: {
        r: 0,
        c: 5
      }
    },

    {
      s: {
        r: 1,
        c: 0
      },

      e: {
        r: 1,
        c: 5
      }
    }

  ]


  /*
   * =========================================
   * SUMMARY SHEET
   * =========================================
   */

  const summaryRows:
    any[][] = []


  summaryRows.push(
    [
      'SUMMARY'
    ]
  )


  summaryRows.push(
    []
  )


  summaryRows.push(
    [
      'MASTERY LEVEL',
      'TEST ITEM',
      'REMARKS'
    ]
  )


  masterySummary.value.forEach(
    summary => {

      summaryRows.push(
        [

          summary.level,

          summary.itemNumbers,

          summary.description

        ]
      )

    }
  )


  const summarySheet =
    XLSX.utils
      .aoa_to_sheet(
        summaryRows
      )


  summarySheet['!cols'] = [

    {
      wch: 30
    },

    {
      wch: 55
    },

    {
      wch: 90
    }

  ]


  summarySheet['!merges'] = [

    {
      s: {
        r: 0,
        c: 0
      },

      e: {
        r: 0,
        c: 2
      }
    }

  ]


  /*
   * =========================================
   * WORKBOOK
   * =========================================
   */

  const workbook =
    XLSX.utils.book_new()


  XLSX.utils
    .book_append_sheet(

      workbook,

      analysisSheet,

      'Item Analysis'

    )


  XLSX.utils
    .book_append_sheet(

      workbook,

      summarySheet,

      'Summary'

    )


  /*
   * Safe filename.
   */
  const filename =
    (
      exam.value.title ||
      'Exam'
    )
      .replace(
        /[\\/:*?"<>|]/g,
        '-'
      )


  XLSX.writeFile(

    workbook,

    `${filename}-Competency-Based-Item-Analysis.xlsx`

  )

}
async function exportPdf() {

  if (exportingPdf.value) {
    return
  }

  exportingPdf.value = true

  try {

    const examId = route.params.id

    const response = await api.get(
      `/exams/${examId}/item-analysis/pdf`,
      {
        responseType: 'blob'
      }
    )

    const blob = new Blob(
      [response.data],
      {
        type: 'application/pdf'
      }
    )

    const url =
      window.URL.createObjectURL(blob)

    const link =
      document.createElement('a')

    const safeTitle =
      (
        exam.value.title ||
        'Exam'
      )
        .replace(
          /[\\/:*?"<>|]/g,
          '-'
        )

    link.href = url

    link.download =
      `${safeTitle}-Item-Analysis.pdf`

    document.body.appendChild(link)

    link.click()

    link.remove()

    window.URL.revokeObjectURL(url)

  } catch (error) {

    console.error(
      'PDF EXPORT ERROR:',
      error
    )

    alert(
      'Unable to generate Item Analysis PDF.'
    )

  } finally {

    exportingPdf.value = false

  }
}

/* =====================================================
   MOUNT
===================================================== */

onMounted(() => {

  fetchItemAnalysis()

})

</script>


<style scoped>

/* ==========================================
   GLOBAL
========================================== */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}


.analysis-page {

  min-height: 100vh;

  padding: 30px;

  background: #f3f6f4;

  font-family:
    'Poppins',
    Arial,
    sans-serif;

  color: #172033;

}


/* ==========================================
   PAGE HEADER
========================================== */

.page-header {

  display: flex;

  justify-content: space-between;

  align-items: flex-start;

  gap: 20px;

  margin-bottom: 28px;

}


.page-header h1 {

  margin-bottom: 6px;

  font-size: 34px;

  color: #112244;

}


.page-header p {

  color: #64748b;

  font-size: 14px;

}


.back-btn {

  margin-bottom: 14px;

  padding: 9px 16px;

  border: none;

  border-radius: 9px;

  background: #e8f3ec;

  color: #166534;

  cursor: pointer;

  font-weight: 700;

}


.back-btn:hover {

  background: #d5eadc;

}


.export-btn {

  padding: 13px 20px;

  border: none;

  border-radius: 11px;

  background: #16a34a;

  color: white;

  font-weight: 700;

  cursor: pointer;

  box-shadow:
    0 8px 20px
    rgba(22, 163, 74, .20);

}


.export-btn:hover {

  background: #15803d;

}


/* ==========================================
   STATE
========================================== */

.state-card {

  width: min(
    100%,
    500px
  );

  margin:
    80px
    auto;

  padding: 40px;

  text-align: center;

  background: white;

  border-radius: 18px;

  box-shadow:
    0 10px 30px
    rgba(0,0,0,.08);

}


.state-card h2 {

  margin-bottom: 8px;

  color: #112244;

}


.state-card p {

  color: #64748b;

}


.state-icon {

  margin-bottom: 12px;

  font-size: 40px;

}


.loader {

  width: 46px;

  height: 46px;

  margin:
    0 auto
    18px;

  border:
    4px solid
    #dcfce7;

  border-top-color:
    #16a34a;

  border-radius:
    50%;

  animation:
    spin .7s
    linear
    infinite;

}


@keyframes spin {

  to {

    transform:
      rotate(
        360deg
      );

  }

}


.retry-btn {

  margin-top: 18px;

  padding: 11px 20px;

  border: none;

  border-radius: 9px;

  background: #16a34a;

  color: white;

  cursor: pointer;

  font-weight: 700;

}


/* ==========================================
   REPORT INFORMATION
========================================== */

.report-information {

  margin-bottom: 25px;

  padding: 28px;

  background: #ffffff;

  border:
    1px solid
    #d9e2dc;

  border-radius: 16px;

  box-shadow:
    0 8px 25px
    rgba(0,0,0,.05);

}


.school-header {

  margin-bottom: 25px;

  text-align: center;

}


.school-header h2 {

  margin-bottom: 5px;

  color: #10261a;

  font-size: 24px;

}


.school-header strong {

  color: #475569;

  font-size: 13px;

}


.exam-information {

  display: grid;

  grid-template-columns:
    1fr
    320px;

  gap: 30px;

}


.exam-details {

  display: grid;

  grid-template-columns:
    repeat(
      3,
      minmax(0,1fr)
    );

  gap: 15px;

}


.exam-details div {

  padding: 14px;

  border-radius: 10px;

  background: #f8fafc;

}


.exam-details small {

  display: block;

  margin-bottom: 5px;

  color: #64748b;

}


.exam-details strong {

  color: #172033;

}


.exam-statistics {

  border-left:
    2px solid
    #e2e8f0;

  padding-left: 25px;

}


.exam-statistics div {

  display: flex;

  justify-content: space-between;

  gap: 20px;

  padding:
    4px
    0;

  font-size: 13px;

}


.exam-statistics span {

  color: #475569;

  font-weight: 600;

}


.exam-statistics strong {

  color: #111827;

}


/* ==========================================
   SUMMARY CARDS
========================================== */

.summary-grid {

  display: grid;

  grid-template-columns:
    repeat(
      4,
      1fr
    );

  gap: 18px;

  margin-bottom: 25px;

}


.summary-card {

  padding: 21px;

  background: white;

  border-radius: 15px;

  border:
    1px solid
    #e3e9e5;

  box-shadow:
    0 7px 20px
    rgba(0,0,0,.04);

}


.summary-card small {

  color: #64748b;

}


.summary-card h2 {

  margin-top: 8px;

  color: #112244;

  font-size: 31px;

}


/* ==========================================
   FILTERS
========================================== */

.filter-panel {

  margin-bottom: 25px;

  padding: 20px;

  background: white;

  border-radius: 15px;

  border:
    1px solid
    #e3e9e5;

}


.filter-buttons {

  display: flex;

  flex-wrap: wrap;

  gap: 9px;

  margin-bottom: 18px;

}


.filter-buttons button {

  padding:
    9px
    15px;

  border: none;

  border-radius:
    999px;

  background:
    #edf2ef;

  color:
    #475569;

  cursor: pointer;

  font-size:
    12px;

  font-weight:
    700;

}


.filter-buttons button.active {

  background:
    #166534;

  color:
    #ffffff;

}


.filter-controls {

  display: flex;

  gap: 12px;

}


.filter-controls input {

  flex: 1;

}


.filter-controls input,
.filter-controls select {

  min-height: 44px;

  padding:
    0
    13px;

  border:
    1px solid
    #cbd5e1;

  border-radius:
    9px;

  background:
    #f8fafc;

  outline:
    none;

}


.filter-controls input:focus,
.filter-controls select:focus {

  border-color:
    #16a34a;

  box-shadow:
    0 0 0 3px
    rgba(22,163,74,.10);

}


/* ==========================================
   TABLE CARDS
========================================== */

.table-card,
.summary-table-card,
.legend-card {

  margin-bottom:
    25px;

  padding:
    24px;

  background:
    #ffffff;

  border:
    1px solid
    #dfe6e1;

  border-radius:
    16px;

  box-shadow:
    0 8px 25px
    rgba(0,0,0,.05);

}


.section-heading {

  margin-bottom:
    20px;

}


.section-heading h2 {

  margin-bottom:
    4px;

  color:
    #112244;

}


.section-heading p {

  color:
    #64748b;

  font-size:
    12px;

}


/* ==========================================
   TABLE
========================================== */

.table-wrapper {

  width:
    100%;

  overflow-x:
    auto;

}


.analysis-table,
.mastery-summary-table {

  width:
    100%;

  border-collapse:
    collapse;

}


.analysis-table th,
.analysis-table td,
.mastery-summary-table th,
.mastery-summary-table td {

  border:
    1px solid
    #94a3a0;

  padding:
    10px 11px;

  vertical-align:
    middle;

  font-size:
    12px;

}


.analysis-table thead th,
.mastery-summary-table thead th {

  background:
    #6b8e23;

  color:
    #ffffff;

  text-align:
    center;

  font-size:
    11px;

  font-weight:
    800;

  text-transform:
    uppercase;

}


.competency-heading {

  min-width:
    260px;

}


.competency-cell {

  min-width:
    260px;

  max-width:
    360px;

  background:
    #fbfdfb;

  text-align:
    center;

  line-height:
    1.55;

  font-weight:
    600;

}


.center-cell {

  text-align:
    center;

}


.item-number {

  font-weight:
    700;

}


.empty-table {

  padding:
    35px !important;

  text-align:
    center;

  color:
    #64748b;

}


/* ==========================================
   MASTERY BADGES
========================================== */

.mastery-badge {

  display:
    inline-block;

  padding:
    5px
    8px;

  border-radius:
    5px;

  font-size:
    10px;

  font-weight:
    700;

  white-space:
    nowrap;

}


.mastery-badge.mastered {

  background:
    #23452b;

  color:
    #ffffff;

}


.mastery-badge.approximating {

  background:
    #30475f;

  color:
    #ffffff;

}


.mastery-badge.moving {

  background:
    #7c4a3a;

  color:
    #ffffff;

}


.mastery-badge.average {

  background:
    #8c4055;

  color:
    #ffffff;

}


.mastery-badge.low {

  background:
    #7a253a;

  color:
    #ffffff;

}


/* ==========================================
   REMARK BADGES
========================================== */

.remarks-badge {

  display:
    inline-block;

  min-width:
    74px;

  padding:
    5px
    8px;

  border-radius:
    5px;

  font-size:
    10px;

  font-weight:
    700;

}


.remarks-badge.retain-revise {

  background:
    #6b8e23;

  color:
    white;

}


.remarks-badge.retain {

  background:
    #7a6042;

  color:
    white;

}


.remarks-badge.revise {

  background:
    #7a4939;

  color:
    white;

}


.remarks-badge.reject {

  background:
    #a53645;

  color:
    white;

}


/* ==========================================
   SUMMARY TABLE
========================================== */

.mastery-name-cell {

  width:
    220px;

  text-align:
    center;

}


.summary-items {

  width:
    320px;

  text-align:
    center;

  line-height:
    1.7;

}


.summary-description {

  min-width:
    450px;

  line-height:
    1.55;

  color:
    #334155;

}


/* ==========================================
   LEGEND
========================================== */

.legend-card h3 {

  margin-bottom:
    15px;

  color:
    #112244;

}


.legend-grid {

  display:
    grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0,1fr)
    );

  gap:
    25px;

}


.legend-column {

  display:
    flex;

  flex-direction:
    column;

  gap:
    8px;

}


.legend-item {

  display:
    flex;

  align-items:
    center;

  gap:
    9px;

  font-size:
    12px;

  color:
    #334155;

}


.legend-box {

  width:
    18px;

  height:
    18px;

  border-radius:
    3px;

}


.legend-box.mastered {

  background:
    #23452b;

}


.legend-box.approximating {

  background:
    #30475f;

}


.legend-box.moving {

  background:
    #7c4a3a;

}


.legend-box.average {

  background:
    #8c4055;

}


.legend-box.low {

  background:
    #7a253a;

}


.legend-box.retain-revise {

  background:
    #6b8e23;

}


.legend-box.retain {

  background:
    #7a6042;

}


.legend-box.revise {

  background:
    #7a4939;

}


.legend-box.reject {

  background:
    #a53645;

}


/* ==========================================
   TABLE ROW HOVER
========================================== */

.analysis-table tbody tr:hover td {

  background:
    #f7faf8;

}


.analysis-table tbody tr:hover
.competency-cell {

  background:
    #f3f7f4;

}


/* ==========================================
   RESPONSIVE
========================================== */

@media(
  max-width: 1100px
) {

  .summary-grid {

    grid-template-columns:
      repeat(
        2,
        1fr
      );

  }
    .export-actions {
    width: 100%;

    flex-direction: column;
  }

  .export-btn,
  .pdf-export-btn {
    width: 100%;
  }


  .exam-information {

    grid-template-columns:
      1fr;

  }


  .exam-statistics {

    padding-left:
      0;

    padding-top:
      15px;

    border-left:
      none;

    border-top:
      2px solid
      #e2e8f0;

  }

}


@media(
  max-width: 768px
) {

  .analysis-page {

    padding:
      18px;

  }


  .page-header {

    flex-direction:
      column;

  }


  .export-btn {

    width:
      100%;

  }


  .exam-details {

    grid-template-columns:
      1fr;

  }


  .filter-controls {

    flex-direction:
      column;

  }


  .filter-controls select {

    width:
      100%;

  }


  .legend-grid {

    grid-template-columns:
      1fr;

  }

}


@media(
  max-width: 500px
) {

  .summary-grid {

    grid-template-columns:
      1fr;

  }


  .page-header h1 {

    font-size:
      27px;

  }


  .report-information,
  .table-card,
  .summary-table-card,
  .legend-card {

    padding:
      17px;

  }

}
.export-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pdf-export-btn {
  border: none;

  background: #dc2626;

  color: #ffffff;

  padding: 14px 22px;

  border-radius: 12px;

  cursor: pointer;

  font-weight: 600;

  transition: .25s;
}

.pdf-export-btn:hover:not(:disabled) {
  background: #b91c1c;
}

.pdf-export-btn:disabled {
  opacity: .65;

  cursor: not-allowed;
}

</style>
