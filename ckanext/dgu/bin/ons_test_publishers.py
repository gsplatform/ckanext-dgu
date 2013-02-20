'''Test tool to check that the ONS sources can be translated into actual
DGU publishers. Run it against data.gov.uk or a test CKAN server.

Due to it originally importing paste/registry, this file was not put
in the test directory.
'''

import sys
import logging

from ckanclient import CkanClient

logging.basicConfig(level=logging.INFO)
log = logging.getLogger()

def command(ckan_api_url):

        from ckanext.dgu.ons.importer import OnsImporter
        # sources pasted here from http://www.statistics.gov.uk/hub/statistics-producers/index.html
        sources = '''
Agri-Food and Biosciences Institute
Agriculture and Rural Development (Northern Ireland)
Business, Innovation and Skills
Cabinet Office
Child Maintenance and Enforcement Commission
Communities and Local Government
Culture, Media and Sport
Defence
Education
Education (Northern Ireland)
Employment and Learning (Northern Ireland)
Energy and Climate Change
Enterprise, Trade and Investment (Northern Ireland)
Environment (Northern Ireland)
Environment, Food and Rural Affairs
Food Standards Agency
Forestry Commission
HM Revenue and Customs
HM Treasury
Health
Health and Safety Executive
Health and Social Care Information Centre
Health Protection Agency
Health, Social Service and Public Safety (Northern Ireland)
Home Office
ISD Scotland (part of NHS National Services Scotland)
International Development
Justice
Justice (Northern Ireland)
Marine Management Organisation
National Records of Scotland
National Treatment Agency
Northern Ireland Statistics and Research Agency
Office for National Statistics
Office for Rail Regulation
Office for Standards in Education, Children\'s Services and Skills
Office of Qualifications and Examinations Regulation
Office of the First and Deputy First Minister
Passenger Focus
Police Service of Northern Ireland (PSNI)
Regional Development (Northern Ireland)
Scottish Government
Social Development (Northern Ireland)
Transport
Welsh Government
Work and Pensions
Civil Aviation Authority
Higher Education Statistics Agency
Eurostat
'''
        ckanclient = CkanClient(base_location=ckan_api_url)
        num_errors = 0
        sources = sources.split('\n')
        for source in sources:
            if not source.strip():
                continue
            publisher = OnsImporter._source_to_publisher_(source.strip(),
                                                          ckanclient)
            if not publisher:
                log.error('Publisher not found: %s', source)
                num_errors += 1
        log.info('Completed with %i errors from %i sources', num_errors, len(sources))

if __name__ == '__main__':
    USAGE = '''ONS Sources test tool
    Usage: python %s {ckan_api_url}

    e.g. python %s http://data.gov.uk/api

    Test tool to check that the ONS sources can be translated into actual
    DGU publishers. Run it against data.gov.uk or a test CKAN server.
    ''' % (sys.argv[0], sys.argv[0])

    err = None
    if len(sys.argv) < 2 or sys.argv[1] in ('--help', '-h'):
        err = 'Error: Please specify CKAN API URL.'
    if len(sys.argv) > 2:
        err = 'Error: Too many arguments.'
    if err:
        print err + '\n\n' + USAGE
        sys.exit(1)
    ckan_api_url = sys.argv[1]

    command(ckan_api_url)
